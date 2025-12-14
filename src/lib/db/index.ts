/**
 * IndexedDB Database using Dexie.js
 */

import Dexie, { type Table } from 'dexie';

// Types
export interface Deck {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  cardCount: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  sourceFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  clozes: ClozeItem[];
  trapOptions: string[];
  tags: string[];
  state: CardState;
  difficulty: number;
  stability: number;
  retrievability: number;
  dueDate: Date;
  lastReview: Date | null;
  reps: number;
  lapses: number;
  elapsedDays: number;
  scheduledDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClozeItem {
  index: number;
  answer: string;
  hint?: string;
  start: number;
  end: number;
}

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: number;
  state: CardState;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  lastElapsedDays: number;
  scheduledDays: number;
  elapsedMs: number;
  reviewedAt: Date;
}

export interface Settings {
  key: string;
  value: string;
}

// Database class
class NeuroTOEICDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  reviewLogs!: Table<ReviewLog, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('neurotoeic');

    this.version(1).stores({
      decks: 'id, name, updatedAt',
      cards: 'id, deckId, state, dueDate, [deckId+state], [deckId+dueDate]',
      reviewLogs: 'id, cardId, deckId, reviewedAt, [deckId+reviewedAt]',
      settings: 'key',
    });
  }
}

// Singleton instance
export const db = new NeuroTOEICDatabase();

// Helper function to generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}
