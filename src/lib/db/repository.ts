/**
 * Database Repository - CRUD Operations
 */

import { db, generateId, type Deck, type Card, type ReviewLog, type CardState, type ClozeItem } from './index';
import type { ParsedDeck } from '../parser/types';

// =============================================================================
// Deck Operations
// =============================================================================

export async function createDeck(
  deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cardCount' | 'newCount' | 'learningCount' | 'reviewCount'>
): Promise<Deck> {
  const now = new Date();
  const newDeck: Deck = {
    id: generateId(),
    ...deck,
    cardCount: 0,
    newCount: 0,
    learningCount: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.decks.add(newDeck);
  return newDeck;
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function getAllDecks(): Promise<Deck[]> {
  return db.decks.orderBy('updatedAt').reverse().toArray();
}

export async function updateDeck(
  id: string,
  updates: Partial<Omit<Deck, 'id' | 'createdAt'>>
): Promise<void> {
  await db.decks.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteDeck(id: string): Promise<void> {
  await db.transaction('rw', [db.decks, db.cards, db.reviewLogs], async () => {
    await db.reviewLogs.where('deckId').equals(id).delete();
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
  });
}

export async function refreshDeckCounts(deckId: string): Promise<void> {
  const now = new Date();
  const cards = await db.cards.where('deckId').equals(deckId).toArray();

  const counts = {
    cardCount: cards.length,
    newCount: cards.filter(c => c.state === 'new').length,
    learningCount: cards.filter(c => c.state === 'learning' || c.state === 'relearning').length,
    reviewCount: cards.filter(c => c.state === 'review' && c.dueDate <= now).length,
  };

  await db.decks.update(deckId, { ...counts, updatedAt: now });
}

// =============================================================================
// Card Operations
// =============================================================================

export async function createCard(
  card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Card> {
  const now = new Date();
  const newCard: Card = {
    id: generateId(),
    ...card,
    createdAt: now,
    updatedAt: now,
  };

  await db.cards.add(newCard);
  return newCard;
}

export async function getCard(id: string): Promise<Card | undefined> {
  return db.cards.get(id);
}

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).sortBy('createdAt');
}

export async function getDueCards(deckId: string, now: Date = new Date()): Promise<Card[]> {
  const cards = await db.cards
    .where('[deckId+dueDate]')
    .between([deckId, Dexie.minKey], [deckId, now])
    .toArray();

  // Sort by priority: relearning > learning > new > review
  const priority: Record<CardState, number> = {
    relearning: 0,
    learning: 1,
    new: 2,
    review: 3,
  };

  return cards.sort((a, b) => {
    const pDiff = priority[a.state] - priority[b.state];
    if (pDiff !== 0) return pDiff;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

export async function getSessionCards(
  deckId: string,
  options: { maxNew?: number; maxReview?: number; now?: Date } = {}
): Promise<Card[]> {
  const { maxNew = 20, maxReview = 100, now = new Date() } = options;

  // Get learning/relearning cards (no limit)
  const learningCards = await db.cards
    .where('[deckId+state]')
    .anyOf([[deckId, 'learning'], [deckId, 'relearning']])
    .filter(c => c.dueDate <= now)
    .toArray();

  // Get new cards (limited)
  const newCards = await db.cards
    .where('[deckId+state]')
    .equals([deckId, 'new'])
    .limit(maxNew)
    .toArray();

  // Get review cards (limited)
  const reviewCards = await db.cards
    .where('[deckId+state]')
    .equals([deckId, 'review'])
    .filter(c => c.dueDate <= now)
    .limit(maxReview)
    .toArray();

  return [...learningCards, ...newCards, ...reviewCards];
}

export async function updateCard(
  id: string,
  updates: Partial<Omit<Card, 'id' | 'deckId' | 'createdAt'>>
): Promise<void> {
  await db.cards.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteCard(id: string): Promise<void> {
  await db.transaction('rw', [db.cards, db.reviewLogs], async () => {
    await db.reviewLogs.where('cardId').equals(id).delete();
    await db.cards.delete(id);
  });
}

// =============================================================================
// Review Log Operations
// =============================================================================

export async function addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<void> {
  await db.reviewLogs.add({
    id: generateId(),
    ...log,
  });
}

export async function getReviewLogs(cardId: string): Promise<ReviewLog[]> {
  return db.reviewLogs
    .where('cardId')
    .equals(cardId)
    .reverse()
    .sortBy('reviewedAt');
}

export async function getReviewStats(deckId: string, days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await db.reviewLogs
    .where('[deckId+reviewedAt]')
    .between([deckId, since], [deckId, new Date()])
    .toArray();

  const totalReviews = logs.length;
  const correctReviews = logs.filter(l => l.rating >= 3).length;
  const totalTime = logs.reduce((sum, l) => sum + l.elapsedMs, 0);
  const uniqueCards = new Set(logs.map(l => l.cardId)).size;

  return {
    totalReviews,
    correctRate: totalReviews > 0 ? correctReviews / totalReviews : 0,
    averageTime: totalReviews > 0 ? totalTime / totalReviews : 0,
    cardsLearned: uniqueCards,
    retentionRate: totalReviews > 0 ? correctReviews / totalReviews : 0,
  };
}

// =============================================================================
// Import Operations
// =============================================================================

export async function importDeck(parsedDeck: ParsedDeck): Promise<Deck> {
  const now = new Date();
  const deckId = generateId();

  const newDeck: Deck = {
    id: deckId,
    name: parsedDeck.name,
    description: parsedDeck.description,
    tags: parsedDeck.tags,
    cardCount: parsedDeck.cards.length,
    newCount: parsedDeck.cards.length,
    learningCount: 0,
    reviewCount: 0,
    sourceFile: parsedDeck.sourceFile,
    createdAt: now,
    updatedAt: now,
  };

  const newCards: Card[] = parsedDeck.cards.map(card => ({
    id: generateId(),
    deckId,
    front: card.front,
    back: card.back,
    clozes: card.clozes as ClozeItem[],
    trapOptions: card.trapOptions,
    tags: card.tags,
    state: 'new' as CardState,
    difficulty: 0,
    stability: 0,
    retrievability: 1,
    dueDate: now,
    lastReview: null,
    reps: 0,
    lapses: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    createdAt: now,
    updatedAt: now,
  }));

  await db.transaction('rw', [db.decks, db.cards], async () => {
    await db.decks.add(newDeck);
    await db.cards.bulkAdd(newCards);
  });

  return newDeck;
}

// =============================================================================
// Statistics Operations
// =============================================================================

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  relearningCards: number;
  masteredCards: number;
  dueToday: number;
  averageRetention: number;
  totalReviews: number;
  streakDays: number;
}

export async function getDeckStats(deckId: string): Promise<DeckStats> {
  const now = new Date();
  const cards = await db.cards.where('deckId').equals(deckId).toArray();
  const logs = await db.reviewLogs.where('deckId').equals(deckId).toArray();

  const totalReviews = logs.length;
  const correctReviews = logs.filter(l => l.rating >= 3).length;

  // Calculate streak
  const reviewDates = [...new Set(
    logs.map(l => l.reviewedAt.toISOString().split('T')[0])
  )].sort().reverse();

  let streakDays = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date();

  for (const dateStr of reviewDates) {
    const expectedDate = checkDate.toISOString().split('T')[0];
    if (dateStr === expectedDate) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (streakDays === 0 && dateStr !== today) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (dateStr === checkDate.toISOString().split('T')[0]) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return {
    totalCards: cards.length,
    newCards: cards.filter(c => c.state === 'new').length,
    learningCards: cards.filter(c => c.state === 'learning').length,
    reviewCards: cards.filter(c => c.state === 'review').length,
    relearningCards: cards.filter(c => c.state === 'relearning').length,
    masteredCards: cards.filter(c => c.stability >= 30).length,
    dueToday: cards.filter(c => c.dueDate <= now).length,
    averageRetention: totalReviews > 0 ? correctReviews / totalReviews : 0,
    totalReviews,
    streakDays,
  };
}

// =============================================================================
// Settings Operations
// =============================================================================

export async function getSetting<T>(key: string): Promise<T | null> {
  const setting = await db.settings.get(key);
  if (!setting) return null;
  return JSON.parse(setting.value) as T;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({
    key,
    value: JSON.stringify(value),
  });
}

// Need to import Dexie for minKey
import Dexie from 'dexie';
