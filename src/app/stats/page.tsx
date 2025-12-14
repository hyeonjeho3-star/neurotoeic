'use client';

import { useState, useEffect } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { db } from '@/lib/db';

interface DailyStats {
  date: string;
  reviewed: number;
  correct: number;
}

export default function StatsPage() {
  const { decks, deckStats } = useDeckStore();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalReviews: 0,
    totalCorrect: 0,
    averageAccuracy: 0,
    streak: 0,
    totalCards: 0,
    masteredCards: 0,
  });

  useEffect(() => {
    loadStats();
  }, [decks]);

  const loadStats = async () => {
    try {
      const logs = await db.reviewLogs.toArray();

      // Daily stats for last 7 days
      const dailyMap = new Map<string, { reviewed: number; correct: number }>();
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { reviewed: 0, correct: 0 });
      }

      for (const log of logs) {
        const dateStr = log.reviewedAt.toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          const stats = dailyMap.get(dateStr)!;
          stats.reviewed++;
          if (log.rating >= 3) stats.correct++;
        }
      }

      setDailyStats(
        Array.from(dailyMap.entries())
          .map(([date, stats]) => ({ date, ...stats }))
          .reverse()
      );

      // Overall stats
      const totalReviews = logs.length;
      const totalCorrect = logs.filter((l) => l.rating >= 3).length;

      // Calculate streak
      const reviewDates = [...new Set(logs.map((l) => l.reviewedAt.toISOString().split('T')[0]))].sort().reverse();
      let streak = 0;
      let checkDate = new Date();

      for (const dateStr of reviewDates) {
        const expectedDate = checkDate.toISOString().split('T')[0];
        if (dateStr === expectedDate) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Get mastered cards
      const cards = await db.cards.toArray();
      const masteredCards = cards.filter((c) => c.stability >= 30).length;

      // Total cards from deck stats
      let totalCards = 0;
      Object.values(deckStats).forEach((stat) => {
        totalCards += stat.totalCards;
      });

      setOverallStats({
        totalReviews,
        totalCorrect,
        averageAccuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
        streak,
        totalCards,
        masteredCards,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const maxDailyReviews = Math.max(...dailyStats.map((s) => s.reviewed), 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Statistics</h1>

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-orange-500">{overallStats.streak}🔥</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p
            className={`text-3xl font-bold ${
              overallStats.averageAccuracy >= 80
                ? 'text-green-500'
                : overallStats.averageAccuracy >= 50
                ? 'text-orange-500'
                : 'text-red-500'
            }`}
          >
            {overallStats.averageAccuracy}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accuracy</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalCards}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Cards</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-500">{overallStats.masteredCards}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mastered</p>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Last 7 Days</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          {dailyStats.some((s) => s.reviewed > 0) ? (
            <div className="flex items-end justify-between h-32 gap-2">
              {dailyStats.map((stat) => {
                const height = (stat.reviewed / maxDailyReviews) * 100;
                const accuracy = stat.reviewed > 0 ? stat.correct / stat.reviewed : 0;
                const dayName = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div className="flex-1 w-full flex items-end justify-center">
                      <div
                        className={`w-6 rounded-t transition-all ${
                          accuracy >= 0.8 ? 'bg-green-500' : accuracy >= 0.5 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{dayName}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{stat.reviewed}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No review data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Deck Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Deck Performance</h2>
        {decks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">No decks imported yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => {
              const stats = deckStats[deck.id];
              const mastery = stats?.totalCards > 0 ? Math.round((stats.masteredCards / stats.totalCards) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{deck.name}</p>
                    <p className="text-sm text-green-500 font-medium">{mastery}% mastered</p>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{stats?.totalCards ?? 0} cards</span>
                    <span className="text-orange-500">{stats?.dueToday ?? 0} due</span>
                    <span className="text-green-500">{stats?.newCards ?? 0} new</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
