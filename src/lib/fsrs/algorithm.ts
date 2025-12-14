/**
 * FSRS 4.5 Core Algorithm Implementation
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 */

import {
  type FSRSParams,
  type Rating,
  DEFAULT_FSRS_PARAMS,
} from './types';

/**
 * Calculate initial difficulty for a new card based on first rating
 * D0(G) = w4 - (G-3) * w5
 */
export function initDifficulty(rating: Rating, params: FSRSParams = DEFAULT_FSRS_PARAMS): number {
  const { w } = params;
  const d = w[4] - (rating - 3) * w[5];
  return clampDifficulty(d);
}

/**
 * Calculate initial stability for a new card based on first rating
 * S0(G) = w[G-1]
 */
export function initStability(rating: Rating, params: FSRSParams = DEFAULT_FSRS_PARAMS): number {
  const { w } = params;
  return Math.max(w[rating - 1], 0.1);
}

/**
 * Calculate next difficulty after a review
 * D'(D,G) = w7 * D0(3) + (1-w7) * (D - w6*(G-3))
 */
export function nextDifficulty(
  d: number,
  rating: Rating,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): number {
  const { w } = params;
  const d0 = initDifficulty(3, params); // Mean difficulty
  const newD = w[7] * d0 + (1 - w[7]) * (d - w[6] * (rating - 3));
  return clampDifficulty(newD);
}

/**
 * Calculate retrievability (probability of recall)
 * R(t,S) = (1 + t/(9*S))^(-1)
 */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

/**
 * Calculate next stability after a successful review (rating >= 2)
 * S'_recall(D,S,R,G) = S * (e^(w8) * (11-D) * S^(-w9) * (e^(w10*(1-R))-1) * hard_penalty * easy_bonus + 1)
 */
export function nextRecallStability(
  d: number,
  s: number,
  r: number,
  rating: Rating,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): number {
  const { w } = params;

  const hardPenalty = rating === 2 ? w[15] : 1;
  const easyBonus = rating === 4 ? w[16] : 1;

  const newS = s * (
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp(w[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus +
    1
  );

  return Math.max(newS, 0.1);
}

/**
 * Calculate next stability after forgetting (rating = 1)
 * S'_forget(D,S,R) = w11 * D^(-w12) * ((S+1)^w13 - 1) * e^(w14*(1-R))
 */
export function nextForgetStability(
  d: number,
  s: number,
  r: number,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): number {
  const { w } = params;

  const newS = w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r));

  return Math.max(Math.min(newS, s), 0.1);
}

/**
 * Calculate next stability based on rating
 */
export function nextStability(
  d: number,
  s: number,
  r: number,
  rating: Rating,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): number {
  if (rating === 1) {
    return nextForgetStability(d, s, r, params);
  }
  return nextRecallStability(d, s, r, rating, params);
}

/**
 * Calculate next interval based on stability and desired retention
 * I(S,R) = S / FACTOR * ln(R)
 * where FACTOR = 19/81 ≈ 0.2346 (derived from R(t,S) formula)
 */
export function nextInterval(
  stability: number,
  requestRetention: number,
  maximumInterval: number = 36500
): number {
  const FACTOR = 19 / 81;
  const interval = stability / FACTOR * Math.log(requestRetention);
  return Math.min(Math.max(Math.round(-interval), 1), maximumInterval);
}

/**
 * Clamp difficulty to valid range [1, 10]
 */
function clampDifficulty(d: number): number {
  return Math.min(Math.max(d, 1), 10);
}

/**
 * Format interval for display
 */
export function formatInterval(days: number): string {
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  }
  if (days < 30) {
    return `${Math.round(days)}d`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}mo`;
  }
  const years = Math.round(days / 365 * 10) / 10;
  return `${years}y`;
}

/**
 * Calculate learning step interval in days
 * Steps are typically in minutes: [1, 10]
 */
export function learningStepInterval(stepMinutes: number): number {
  return stepMinutes / (24 * 60);
}
