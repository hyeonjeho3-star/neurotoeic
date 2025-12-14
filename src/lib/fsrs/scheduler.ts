/**
 * FSRS Scheduler - Manages card scheduling and state transitions
 */

import {
  type FSRSCard,
  type FSRSParams,
  type Rating,
  type CardState,
  type ReviewLog,
  type SchedulingResult,
  type SchedulingCards,
  type IntervalLabels,
  DEFAULT_FSRS_PARAMS,
  createNewCard,
} from './types';

import {
  initDifficulty,
  initStability,
  nextDifficulty,
  nextStability,
  retrievability,
  nextInterval,
  formatInterval,
  learningStepInterval,
} from './algorithm';

export interface SchedulerOptions {
  params?: FSRSParams;
  learningSteps?: number[];    // Learning steps in minutes (default: [1, 10])
  relearningSteps?: number[];  // Relearning steps in minutes (default: [10])
}

const DEFAULT_OPTIONS: Required<SchedulerOptions> = {
  params: DEFAULT_FSRS_PARAMS,
  learningSteps: [1, 10],
  relearningSteps: [10],
};

/**
 * FSRS Scheduler class
 */
export class FSRSScheduler {
  private params: FSRSParams;
  private learningSteps: number[];
  private relearningSteps: number[];

  constructor(options: SchedulerOptions = {}) {
    this.params = options.params ?? DEFAULT_OPTIONS.params;
    this.learningSteps = options.learningSteps ?? DEFAULT_OPTIONS.learningSteps;
    this.relearningSteps = options.relearningSteps ?? DEFAULT_OPTIONS.relearningSteps;
  }

  /**
   * Schedule a card for all possible ratings
   */
  scheduleAll(card: FSRSCard, now: Date = new Date()): SchedulingCards {
    return {
      again: this.schedule(card, 1, now),
      hard: this.schedule(card, 2, now),
      good: this.schedule(card, 3, now),
      easy: this.schedule(card, 4, now),
    };
  }

  /**
   * Get interval labels for UI display
   */
  getIntervalLabels(card: FSRSCard, now: Date = new Date()): IntervalLabels {
    const scheduling = this.scheduleAll(card, now);
    return {
      again: formatInterval(scheduling.again.card.scheduledDays),
      hard: formatInterval(scheduling.hard.card.scheduledDays),
      good: formatInterval(scheduling.good.card.scheduledDays),
      easy: formatInterval(scheduling.easy.card.scheduledDays),
    };
  }

  /**
   * Schedule a card based on user rating
   */
  schedule(card: FSRSCard, rating: Rating, now: Date = new Date()): SchedulingResult {
    const elapsedDays = card.lastReview
      ? (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    const lastElapsedDays = card.elapsedDays;

    let newCard: FSRSCard;

    switch (card.state) {
      case 'new':
        newCard = this.scheduleNew(card, rating, now);
        break;
      case 'learning':
        newCard = this.scheduleLearning(card, rating, now);
        break;
      case 'review':
        newCard = this.scheduleReview(card, rating, now, elapsedDays);
        break;
      case 'relearning':
        newCard = this.scheduleRelearning(card, rating, now);
        break;
      default:
        throw new Error(`Unknown card state: ${card.state}`);
    }

    const log: ReviewLog = {
      cardId: card.id,
      rating,
      state: card.state,
      due: card.dueDate,
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      elapsedDays: Math.round(elapsedDays * 100) / 100,
      lastElapsedDays,
      scheduledDays: newCard.scheduledDays,
      review: now,
    };

    return { card: newCard, log };
  }

  /**
   * Schedule a new card
   */
  private scheduleNew(card: FSRSCard, rating: Rating, now: Date): FSRSCard {
    const difficulty = initDifficulty(rating, this.params);
    const stability = initStability(rating, this.params);

    let state: CardState;
    let scheduledDays: number;
    let dueDate: Date;

    if (rating === 1) {
      // Again: Stay in learning, first step
      state = 'learning';
      scheduledDays = learningStepInterval(this.learningSteps[0]);
    } else if (rating === 2) {
      // Hard: Learning, first step
      state = 'learning';
      scheduledDays = learningStepInterval(this.learningSteps[0]);
    } else if (rating === 3) {
      // Good: If multiple steps, second step; otherwise graduate
      if (this.learningSteps.length > 1) {
        state = 'learning';
        scheduledDays = learningStepInterval(this.learningSteps[1]);
      } else {
        state = 'review';
        scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
      }
    } else {
      // Easy: Graduate immediately
      state = 'review';
      scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
    }

    dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

    return {
      ...card,
      difficulty,
      stability,
      retrievability: 1,
      state,
      dueDate,
      lastReview: now,
      reps: card.reps + 1,
      elapsedDays: 0,
      scheduledDays,
    };
  }

  /**
   * Schedule a learning card
   */
  private scheduleLearning(card: FSRSCard, rating: Rating, now: Date): FSRSCard {
    const difficulty = nextDifficulty(card.difficulty, rating, this.params);
    let stability = card.stability;

    let state: CardState;
    let scheduledDays: number;

    if (rating === 1) {
      // Again: Reset to first step
      state = 'learning';
      scheduledDays = learningStepInterval(this.learningSteps[0]);
    } else if (rating === 2) {
      // Hard: Repeat current step
      state = 'learning';
      scheduledDays = learningStepInterval(this.learningSteps[0]);
    } else if (rating === 3) {
      // Good: Graduate to review
      stability = initStability(rating, this.params);
      state = 'review';
      scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
    } else {
      // Easy: Graduate with bonus
      stability = initStability(rating, this.params);
      state = 'review';
      scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
    }

    const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

    return {
      ...card,
      difficulty,
      stability,
      retrievability: 1,
      state,
      dueDate,
      lastReview: now,
      reps: card.reps + 1,
      elapsedDays: 0,
      scheduledDays,
    };
  }

  /**
   * Schedule a review card
   */
  private scheduleReview(
    card: FSRSCard,
    rating: Rating,
    now: Date,
    elapsedDays: number
  ): FSRSCard {
    const r = retrievability(elapsedDays, card.stability);
    const difficulty = nextDifficulty(card.difficulty, rating, this.params);
    const stability = nextStability(card.difficulty, card.stability, r, rating, this.params);

    let state: CardState;
    let scheduledDays: number;
    let lapses = card.lapses;

    if (rating === 1) {
      // Again: Enter relearning
      state = 'relearning';
      scheduledDays = learningStepInterval(this.relearningSteps[0]);
      lapses += 1;
    } else {
      // Hard/Good/Easy: Stay in review
      state = 'review';
      scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
    }

    const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

    return {
      ...card,
      difficulty,
      stability,
      retrievability: r,
      state,
      dueDate,
      lastReview: now,
      reps: card.reps + 1,
      lapses,
      elapsedDays: Math.round(elapsedDays * 100) / 100,
      scheduledDays,
    };
  }

  /**
   * Schedule a relearning card
   */
  private scheduleRelearning(card: FSRSCard, rating: Rating, now: Date): FSRSCard {
    const difficulty = nextDifficulty(card.difficulty, rating, this.params);
    let stability = card.stability;

    let state: CardState;
    let scheduledDays: number;

    if (rating === 1) {
      // Again: Repeat first step
      state = 'relearning';
      scheduledDays = learningStepInterval(this.relearningSteps[0]);
    } else if (rating === 2) {
      // Hard: Repeat step
      state = 'relearning';
      scheduledDays = learningStepInterval(this.relearningSteps[0]);
    } else {
      // Good/Easy: Graduate back to review
      state = 'review';
      scheduledDays = nextInterval(stability, this.params.requestRetention, this.params.maximumInterval);
    }

    const dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

    return {
      ...card,
      difficulty,
      stability,
      retrievability: 1,
      state,
      dueDate,
      lastReview: now,
      reps: card.reps + 1,
      elapsedDays: 0,
      scheduledDays,
    };
  }

  /**
   * Get cards due for review
   */
  getDueCards(cards: FSRSCard[], now: Date = new Date()): FSRSCard[] {
    return cards
      .filter(card => card.dueDate <= now)
      .sort((a, b) => {
        // Priority: relearning > learning > new > review
        const priority: Record<CardState, number> = {
          relearning: 0,
          learning: 1,
          new: 2,
          review: 3,
        };
        const pDiff = priority[a.state] - priority[b.state];
        if (pDiff !== 0) return pDiff;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
  }

  /**
   * Get cards for a study session
   */
  getSessionCards(
    cards: FSRSCard[],
    options: {
      maxNew?: number;
      maxReview?: number;
      now?: Date;
    } = {}
  ): FSRSCard[] {
    const { maxNew = 20, maxReview = 100, now = new Date() } = options;

    const dueCards = this.getDueCards(cards, now);

    const newCards: FSRSCard[] = [];
    const learningCards: FSRSCard[] = [];
    const relearningCards: FSRSCard[] = [];
    const reviewCards: FSRSCard[] = [];

    for (const card of dueCards) {
      switch (card.state) {
        case 'new':
          if (newCards.length < maxNew) newCards.push(card);
          break;
        case 'learning':
          learningCards.push(card);
          break;
        case 'relearning':
          relearningCards.push(card);
          break;
        case 'review':
          if (reviewCards.length < maxReview) reviewCards.push(card);
          break;
      }
    }

    // Return in priority order
    return [...relearningCards, ...learningCards, ...newCards, ...reviewCards];
  }

  /**
   * Update scheduler parameters
   */
  setParams(params: Partial<FSRSParams>): void {
    this.params = { ...this.params, ...params };
  }

  /**
   * Get current parameters
   */
  getParams(): FSRSParams {
    return { ...this.params };
  }
}

/**
 * Create a default scheduler instance
 */
export function createScheduler(options?: SchedulerOptions): FSRSScheduler {
  return new FSRSScheduler(options);
}

/**
 * Utility: Create a new card with ID
 */
export { createNewCard };
