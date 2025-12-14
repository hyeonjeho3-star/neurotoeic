'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, FolderOpen, BarChart3, Upload } from 'lucide-react';
import { useDeckStore } from '@/stores/deckStore';

export default function HomePage() {
  const { decks, deckStats } = useDeckStore();

  const todayStats = useMemo(() => {
    let totalDue = 0;
    let totalNew = 0;

    for (const deck of decks) {
      const stats = deckStats[deck.id];
      if (stats) {
        totalDue += stats.dueToday;
        totalNew += stats.newCards;
      }
    }

    const estimatedMinutes = Math.ceil((totalDue + Math.min(totalNew, 20)) * 0.5);
    return { totalDue, totalNew, estimatedMinutes };
  }, [decks, deckStats]);

  const suggestedDeck = useMemo(() => {
    let best: { id: string; name: string; due: number } | null = null;

    for (const deck of decks) {
      const stats = deckStats[deck.id];
      if (stats && stats.dueToday > 0) {
        if (!best || stats.dueToday > best.due) {
          best = { id: deck.id, name: deck.name, due: stats.dueToday };
        }
      }
    }

    return best;
  }, [decks, deckStats]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 dark:text-gray-400">Welcome back</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NeuroTOEIC</h1>
      </div>

      {/* Today's Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today&apos;s Learning
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{todayStats.totalDue}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Due</p>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-green-500">{todayStats.totalNew}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">New</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
              ~{todayStats.estimatedMinutes}m
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
          </div>
        </div>

        <Link
          href={suggestedDeck ? `/session/${suggestedDeck.id}` : '/study'}
          className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors ${
            suggestedDeck
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {suggestedDeck
            ? `Study ${suggestedDeck.name}`
            : decks.length > 0
            ? 'All caught up!'
            : 'Import a deck to start'}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/study"
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
          >
            <BookOpen className="text-orange-500 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Study</span>
          </Link>
          <Link
            href="/decks"
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
          >
            <FolderOpen className="text-orange-500 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Decks</span>
          </Link>
          <Link
            href="/stats"
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
          >
            <BarChart3 className="text-orange-500 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stats</span>
          </Link>
        </div>
      </div>

      {/* Your Decks */}
      {decks.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Decks
          </h2>
          <div className="space-y-3">
            {decks.slice(0, 3).map((deck) => {
              const stats = deckStats[deck.id];
              return (
                <Link
                  key={deck.id}
                  href={`/deck/${deck.id}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{deck.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {deck.cardCount} cards
                      {stats && stats.dueToday > 0 && ` • ${stats.dueToday} due`}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              );
            })}
            {decks.length > 3 && (
              <Link
                href="/decks"
                className="block text-center text-orange-500 font-medium py-2 hover:underline"
              >
                View all {decks.length} decks
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No decks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Import a deck file to start learning
          </p>
          <Link
            href="/decks"
            className="inline-block px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            Import Deck
          </Link>
        </div>
      )}
    </div>
  );
}
