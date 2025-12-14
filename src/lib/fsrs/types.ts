/**
 * FSRS (Free Spaced Repetition Scheduler) Type Definitions
 * Based on FSRS 4.5 algorithm
 */

/** Card learning state */
export type CardState = 'new' | 'learning' | 'review' | 'relearning';

/** User response rating for a card review */
export type Rating = 1 | 2 | 3 | 4;

export const RatingLabel: Record<Rating, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

/** FSRS Card data structure */
export interface FSRSCard {
  /** Unique identifier */
  id: string;
  /** Difficulty rating (0-1, higher = more difficult) */
  difficulty: number;
  /** Stability in days (how long until R drops to target retention) */
  stability: number;
  /** Current retrievability (0-1, probability of recall) */
  retrievability: number;
  /** Current learning state */
  state: CardState;
  /** Next scheduled review date */
  dueDate: Date;
  /** Last review date (null for new cards) */
  lastReview: Date | null;
  /** Total successful review count */
  reps: number;
  /** Number of times card was forgotten (rated Again after learning) */
  lapses: number;
  /** Days since last review */
  elapsedDays: number;
  /** Scheduled interval in days */
  scheduledDays: number;
}

/** Review log entry */
export interface ReviewLog {
  /** Card ID */
  cardId: string;
  /** User rating */
  rating: Rating;
  /** Card state before review */
  state: CardState;
  /** Due date at time of review */
  due: Date;
  /** Stability after review */
  stability: number;
  /** Difficulty after review */
  difficulty: number;
  /** Days elapsed since last review */
  elapsedDays: number;
  /** Previously scheduled days */
  lastElapsedDays: number;
  /** New scheduled interval in days */
  scheduledDays: number;
  /** Timestamp of this review */
  review: Date;
  /** Time taken to respond in milliseconds */
  elapsedMs?: number;
}

/** FSRS algorithm parameters */
export interface FSRSParams {
  /** Target retention rate (default 0.9 = 90%) */
  requestRetention: number;
  /** Maximum interval in days (default 36500 = 100 years) */
  maximumInterval: number;
  /** 17 FSRS weights (w0 to w16) */
  w: number[];
}

/** Scheduling result for a card */
export interface SchedulingResult {
  /** Updated card data */
  card: FSRSCard;
  /** Review log entry */
  log: ReviewLog;
}

/** Scheduling options for all ratings */
export interface SchedulingCards {
  again: SchedulingResult;
  hard: SchedulingResult;
  good: SchedulingResult;
  easy: SchedulingResult;
}

/** Interval labels for UI display */
export interface IntervalLabels {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

/** Default FSRS 4.5 parameters */
export const DEFAULT_FSRS_PARAMS: FSRSParams = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    0.34, 1.26, 0.29, 2.61,
  ],
};

/** Create a new FSRS card with default values */
export function createNewCard(id: string): FSRSCard {
  return {
    id,
    difficulty: 0,
    stability: 0,
    retrievability: 1,
    state: 'new',
    dueDate: new Date(),
    lastReview: null,
    reps: 0,
    lapses: 0,
    elapsedDays: 0,
    scheduledDays: 0,
  };
}
