/**
 * Session Store - Manages active learning session state
 */

import { create } from 'zustand';
import * as repository from '@/lib/db/repository';
import { FSRSScheduler, type Rating } from '@/lib/fsrs';
import type { Card, CardState } from '@/lib/db';
import { useSettingsStore } from './settingsStore';

export type SessionMode = 'micro' | 'timed' | 'all';

export interface SessionState {
  // Session info
  isActive: boolean;
  mode: SessionMode;
  deckId: string | null;
  startedAt: Date | null;

  // Cards
  cards: Card[];
  currentIndex: number;
  currentCard: Card | null;

  // Progress
  reviewed: number;
  correct: number;
  incorrect: number;

  // Timer
  targetMinutes: number;
  remainingSeconds: number;
  isPaused: boolean;
  showRestReminder: boolean;

  // Actions
  startSession: (
    deckId: string,
    options: { mode: SessionMode; minutes: number; maxNew?: number; maxReview?: number }
  ) => Promise<void>;
  answerCard: (rating: Rating) => Promise<void>;
  endSession: () => Promise<{ reviewed: number; correct: number; incorrect: number } | null>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  dismissRestReminder: () => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isActive: false,
  mode: 'micro',
  deckId: null,
  startedAt: null,

  cards: [],
  currentIndex: 0,
  currentCard: null,

  reviewed: 0,
  correct: 0,
  incorrect: 0,

  targetMinutes: 10,
  remainingSeconds: 600,
  isPaused: false,
  showRestReminder: false,

  startSession: async (deckId, options) => {
    const { mode, minutes, maxNew = 20, maxReview = 100 } = options;

    const cards = await repository.getSessionCards(deckId, {
      maxNew,
      maxReview,
    });

    if (cards.length === 0) {
      throw new Error('No cards to study');
    }

    set({
      isActive: true,
      mode,
      deckId,
      startedAt: new Date(),
      cards,
      currentIndex: 0,
      currentCard: cards[0],
      reviewed: 0,
      correct: 0,
      incorrect: 0,
      targetMinutes: minutes,
      remainingSeconds: minutes * 60,
      isPaused: false,
      showRestReminder: false,
    });
  },

  answerCard: async (rating) => {
    const { currentCard, cards, currentIndex, deckId } = get();
    if (!currentCard || !deckId) return;

    const settings = useSettingsStore.getState();
    const scheduler = new FSRSScheduler({
      params: {
        requestRetention: settings.requestRetention,
        maximumInterval: settings.maximumInterval,
        w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
      },
      learningSteps: settings.learningSteps,
      relearningSteps: settings.relearningSteps,
    });

    const startTime = Date.now();

    // Schedule the card
    const result = scheduler.schedule(
      {
        id: currentCard.id,
        difficulty: currentCard.difficulty,
        stability: currentCard.stability,
        retrievability: currentCard.retrievability,
        state: currentCard.state,
        dueDate: currentCard.dueDate,
        lastReview: currentCard.lastReview,
        reps: currentCard.reps,
        lapses: currentCard.lapses,
        elapsedDays: currentCard.elapsedDays,
        scheduledDays: currentCard.scheduledDays,
      },
      rating
    );

    const updatedCardData = result.card;

    // Update card in database
    await repository.updateCard(currentCard.id, {
      state: updatedCardData.state as CardState,
      difficulty: updatedCardData.difficulty,
      stability: updatedCardData.stability,
      retrievability: updatedCardData.retrievability,
      dueDate: updatedCardData.dueDate,
      lastReview: updatedCardData.lastReview,
      reps: updatedCardData.reps,
      lapses: updatedCardData.lapses,
      elapsedDays: updatedCardData.elapsedDays,
      scheduledDays: updatedCardData.scheduledDays,
    });

    // Add review log
    await repository.addReviewLog({
      cardId: currentCard.id,
      deckId,
      rating,
      state: updatedCardData.state as CardState,
      stability: updatedCardData.stability,
      difficulty: updatedCardData.difficulty,
      elapsedDays: updatedCardData.elapsedDays,
      lastElapsedDays: currentCard.elapsedDays,
      scheduledDays: updatedCardData.scheduledDays,
      elapsedMs: Date.now() - startTime,
      reviewedAt: new Date(),
    });

    // Update stats
    const isCorrect = rating >= 3;
    const newReviewed = get().reviewed + 1;
    const newCorrect = get().correct + (isCorrect ? 1 : 0);
    const newIncorrect = get().incorrect + (isCorrect ? 0 : 1);

    // Move to next card
    let nextIndex = currentIndex + 1;
    let nextCards = [...cards];

    // If card needs to be seen again soon (learning/relearning), add it back to queue
    if (updatedCardData.state === 'learning' || updatedCardData.state === 'relearning') {
      const updatedCard = { ...currentCard, ...updatedCardData } as Card;
      nextCards.push(updatedCard);
    }

    // Remove current card from queue
    nextCards = nextCards.filter((_, i) => i !== currentIndex);

    // Check if session is complete
    if (nextCards.length === 0) {
      set({
        reviewed: newReviewed,
        correct: newCorrect,
        incorrect: newIncorrect,
        cards: [],
        currentCard: null,
        isActive: false,
      });

      // Refresh deck stats
      await repository.refreshDeckCounts(deckId);
      return;
    }

    // Adjust index if needed
    if (nextIndex >= nextCards.length) {
      nextIndex = 0;
    }

    set({
      cards: nextCards,
      currentIndex: nextIndex,
      currentCard: nextCards[nextIndex],
      reviewed: newReviewed,
      correct: newCorrect,
      incorrect: newIncorrect,
    });
  },

  endSession: async () => {
    const { reviewed, correct, incorrect, deckId, isActive } = get();

    if (!isActive) return null;

    set({
      isActive: false,
      cards: [],
      currentCard: null,
    });

    if (deckId) {
      await repository.refreshDeckCounts(deckId);
    }

    return { reviewed, correct, incorrect };
  },

  pauseTimer: () => {
    set({ isPaused: true });
  },

  resumeTimer: () => {
    set({ isPaused: false });
  },

  dismissRestReminder: () => {
    set({ showRestReminder: false });
  },

  tick: () => {
    const { isPaused, remainingSeconds, isActive, mode } = get();

    if (!isActive || isPaused || remainingSeconds <= 0) return;

    const newRemaining = remainingSeconds - 1;
    const settings = useSettingsStore.getState();

    // Check for rest reminder
    const elapsedMinutes = (get().targetMinutes * 60 - newRemaining) / 60;
    const shouldShowReminder =
      settings.restReminderMinutes > 0 &&
      elapsedMinutes > 0 &&
      elapsedMinutes % settings.restReminderMinutes === 0;

    // Auto-end session when timer reaches 0 (for timed modes)
    if (newRemaining <= 0 && mode !== 'all') {
      set({
        remainingSeconds: 0,
        isActive: false,
      });
      return;
    }

    set({
      remainingSeconds: newRemaining,
      showRestReminder: shouldShowReminder ? true : get().showRestReminder,
    });
  },
}));
