/**
 * Deck Store - Manages deck list and selection state
 */

import { create } from 'zustand';
import * as repository from '@/lib/db/repository';
import type { Deck } from '@/lib/db';
import type { ParsedDeck } from '@/lib/parser/types';

export interface DeckState {
  decks: Deck[];
  selectedDeckId: string | null;
  deckStats: Record<string, repository.DeckStats>;
  isLoading: boolean;
  error: string | null;

  loadDecks: () => Promise<void>;
  selectDeck: (id: string | null) => void;
  getDeck: (id: string) => Deck | undefined;
  importDeck: (parsedDeck: ParsedDeck) => Promise<Deck>;
  deleteDeck: (id: string) => Promise<void>;
  refreshDeckStats: (id: string) => Promise<void>;
  refreshAllStats: () => Promise<void>;
  clearError: () => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  selectedDeckId: null,
  deckStats: {},
  isLoading: false,
  error: null,

  loadDecks: async () => {
    set({ isLoading: true, error: null });

    try {
      const decks = await repository.getAllDecks();
      set({ decks, isLoading: false });
      await get().refreshAllStats();
    } catch (error) {
      console.error('Failed to load decks:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load decks',
      });
    }
  },

  selectDeck: (id) => {
    set({ selectedDeckId: id });
    if (id) {
      get().refreshDeckStats(id);
    }
  },

  getDeck: (id) => {
    return get().decks.find((d) => d.id === id);
  },

  importDeck: async (parsedDeck) => {
    set({ isLoading: true, error: null });

    try {
      const deck = await repository.importDeck(parsedDeck);

      set((state) => ({
        decks: [deck, ...state.decks],
        isLoading: false,
      }));

      await get().refreshDeckStats(deck.id);
      return deck;
    } catch (error) {
      console.error('Failed to import deck:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to import deck',
      });
      throw error;
    }
  },

  deleteDeck: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await repository.deleteDeck(id);

      set((state) => ({
        decks: state.decks.filter((d) => d.id !== id),
        selectedDeckId: state.selectedDeckId === id ? null : state.selectedDeckId,
        isLoading: false,
      }));

      set((state) => {
        const { [id]: _, ...remainingStats } = state.deckStats;
        return { deckStats: remainingStats };
      });
    } catch (error) {
      console.error('Failed to delete deck:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete deck',
      });
      throw error;
    }
  },

  refreshDeckStats: async (id) => {
    try {
      await repository.refreshDeckCounts(id);
      const stats = await repository.getDeckStats(id);

      set((state) => ({
        deckStats: {
          ...state.deckStats,
          [id]: stats,
        },
      }));

      const updatedDeck = await repository.getDeck(id);
      if (updatedDeck) {
        set((state) => ({
          decks: state.decks.map((d) => (d.id === id ? updatedDeck : d)),
        }));
      }
    } catch (error) {
      console.error('Failed to refresh deck stats:', error);
    }
  },

  refreshAllStats: async () => {
    const { decks } = get();

    try {
      const statsPromises = decks.map(async (deck) => {
        const stats = await repository.getDeckStats(deck.id);
        return { id: deck.id, stats };
      });

      const results = await Promise.all(statsPromises);

      const deckStats: Record<string, repository.DeckStats> = {};
      for (const { id, stats } of results) {
        deckStats[id] = stats;
      }

      set({ deckStats });
    } catch (error) {
      console.error('Failed to refresh all stats:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
