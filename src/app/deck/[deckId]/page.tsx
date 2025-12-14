'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Clock, BookOpen, BarChart2, Tag, Calendar, Trash2 } from 'lucide-react';
import { useDeckStore } from '@/stores/deckStore';

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const { getDeck, deckStats, deleteDeck } = useDeckStore();
  const deck = getDeck(deckId);
  const stats = deckStats[deckId];

  if (!deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Deck not found</p>
        <Link
          href="/decks"
          className="text-orange-500 hover:underline"
        >
          Back to Decks
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Delete "${deck.name}"? This cannot be undone.`)) {
      await deleteDeck(deckId);
      router.push('/decks');
    }
  };

  const masteredPercent = deck.cardCount > 0
    ? Math.round(((stats?.masteredCards ?? 0) / deck.cardCount) * 100)
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {deck.name}
          </h1>
          {deck.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {deck.description}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete deck"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Tags */}
      {deck.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {deck.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full"
            >
              <Tag size={14} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{deck.cardCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Cards</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="w-6 h-6 mx-auto text-green-500 mb-2 font-bold text-xl">+</div>
          <p className="text-2xl font-bold text-green-500">{stats?.newCards ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">New</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Clock className="mx-auto text-orange-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-orange-500">{stats?.dueToday ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Due Today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <BarChart2 className="mx-auto text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-blue-500">{masteredPercent}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mastered</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-gray-700 dark:text-gray-300">{masteredPercent}% Mastered</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-green-500 transition-all duration-500"
            style={{ width: `${masteredPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>New: {stats?.newCards ?? 0}</span>
          <span>Learning: {stats?.learningCards ?? 0}</span>
          <span>Review: {stats?.reviewCards ?? 0}</span>
          <span>Mastered: {stats?.masteredCards ?? 0}</span>
        </div>
      </div>

      {/* Study Options */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Start Study Session</h2>

        {/* Quick Session */}
        <Link
          href={`/session/${deckId}?mode=micro&minutes=5`}
          className="flex items-center justify-between p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Play size={24} />
            <div>
              <p className="font-semibold">Quick Session</p>
              <p className="text-sm opacity-90">5 minutes • Perfect for breaks</p>
            </div>
          </div>
          <span className="text-2xl">5m</span>
        </Link>

        {/* Standard Session */}
        <Link
          href={`/session/${deckId}?mode=micro&minutes=10`}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={24} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Standard Session</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">10 minutes • Recommended daily</p>
            </div>
          </div>
          <span className="text-2xl text-orange-500">10m</span>
        </Link>

        {/* Long Session */}
        <Link
          href={`/session/${deckId}?mode=timed&minutes=20`}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={24} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Long Session</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">20 minutes • Deep focus</p>
            </div>
          </div>
          <span className="text-2xl text-blue-500">20m</span>
        </Link>

        {/* All Due */}
        {(stats?.dueToday ?? 0) > 0 && (
          <Link
            href={`/session/${deckId}?mode=all`}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-green-500" size={24} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Review All Due</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Study all {stats?.dueToday} due cards</p>
              </div>
            </div>
            <span className="text-xl text-green-500">{stats?.dueToday}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
