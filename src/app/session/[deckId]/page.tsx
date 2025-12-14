'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { X, Pause, Play } from 'lucide-react';
import { useSessionStore, type SessionMode } from '@/stores/sessionStore';
import { useDeckStore } from '@/stores/deckStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { FSRSScheduler, type Rating } from '@/lib/fsrs';
import { FlashCard } from '@/components/FlashCard';
import { RatingButtons } from '@/components/RatingButtons';

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const deckId = params.deckId as string;
  const mode = (searchParams.get('mode') as SessionMode) || 'micro';
  const minutes = parseInt(searchParams.get('minutes') || '10', 10);

  const { getDeck } = useDeckStore();
  const settings = useSettingsStore();
  const {
    isActive,
    currentCard,
    cards,
    currentIndex,
    reviewed,
    correct,
    incorrect,
    targetMinutes,
    remainingSeconds,
    isPaused,
    startSession,
    answerCard,
    endSession,
    pauseTimer,
    resumeTimer,
    tick,
  } = useSessionStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const deck = getDeck(deckId);

  // Start session on mount
  useEffect(() => {
    if (!isActive && deckId) {
      startSession(deckId, {
        mode,
        minutes,
        maxNew: settings.maxNewCardsPerDay,
        maxReview: settings.maxReviewsPerDay,
      }).catch((error) => {
        alert(error.message || 'Failed to start session');
        router.back();
      });
    }
  }, [deckId, mode, minutes, isActive, startSession, settings, router]);

  // Timer tick
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, tick]);

  // Get interval labels for rating buttons
  const getIntervalLabels = useCallback(() => {
    if (!currentCard) {
      return { again: '-', hard: '-', good: '-', easy: '-' };
    }

    const scheduler = new FSRSScheduler({
      params: {
        requestRetention: settings.requestRetention,
        maximumInterval: settings.maximumInterval,
        w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
      },
      learningSteps: settings.learningSteps,
      relearningSteps: settings.relearningSteps,
    });

    return scheduler.getIntervalLabels({
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
    });
  }, [currentCard, settings]);

  const handleRate = async (rating: Rating) => {
    setIsFlipped(false);
    // Small delay to allow flip animation to complete before showing next card
    await new Promise(resolve => setTimeout(resolve, 150));
    await answerCard(rating);
  };

  const handleEndSession = async () => {
    if (confirm('End session?')) {
      const result = await endSession();
      if (result) {
        setShowResult(true);
      } else {
        router.back();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if time is up (timer reached 0)
  const timeIsUp = remainingSeconds <= 0 && mode !== 'all';

  // Session completed
  if (showResult || (!isActive && reviewed > 0) || timeIsUp) {
    const correctRate = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-6xl mb-4">
          {correctRate >= 80 ? '🎉' : correctRate >= 50 ? '👍' : '💪'}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Session Complete!
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Cards Reviewed</span>
            <span className="font-semibold text-gray-900 dark:text-white">{reviewed}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Correct</span>
            <span className="font-semibold text-green-500">{correct} ({correctRate}%)</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500 dark:text-gray-400">Incorrect</span>
            <span className="font-semibold text-red-500">{incorrect}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full max-w-sm py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  // Loading state
  if (!isActive || !currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading cards...</p>
      </div>
    );
  }

  const progressPercent = ((targetMinutes * 60 - remainingSeconds) / (targetMinutes * 60)) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleEndSession}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
          {deck?.name || 'Study'}
        </h1>
        <button
          onClick={isPaused ? resumeTimer : pauseTimer}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
      </header>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {formatTime(remainingSeconds)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <span className="text-green-500">✓ {correct}</span>
          <span className="text-red-500">✗ {incorrect}</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <FlashCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(true)}
        />
      </div>

      {/* Rating buttons */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {isFlipped ? (
          <RatingButtons onRate={handleRate} intervals={getIntervalLabels()} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Tap the card to reveal the answer
          </p>
        )}
      </div>
    </div>
  );
}
