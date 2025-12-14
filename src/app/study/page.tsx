'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, BookOpen } from 'lucide-react';
import { useDeckStore } from '@/stores/deckStore';
import { cn } from '@/lib/utils';

type SessionMode = 'micro' | 'deep';

const SESSION_DURATIONS = {
  micro: [5, 10, 15],
  deep: [30, 45, 60],
};

export default function StudyPage() {
  const router = useRouter();
  const { decks, deckStats } = useDeckStore();

  const [selectedMode, setSelectedMode] = useState<SessionMode>('micro');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const handleStartSession = () => {
    if (!selectedDeckId) return;
    router.push(`/session/${selectedDeckId}?mode=${selectedMode}&minutes=${selectedDuration}`);
  };

  const durations = SESSION_DURATIONS[selectedMode];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Start Study Session
      </h1>

      {/* Session Mode */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Session Mode
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSelectedMode('micro');
              setSelectedDuration(10);
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              selectedMode === 'micro'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
            )}
          >
            <Zap
              className={cn(
                'mx-auto mb-2',
                selectedMode === 'micro' ? 'text-orange-500' : 'text-gray-400'
              )}
              size={24}
            />
            <p className={cn(
              'font-semibold',
              selectedMode === 'micro' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
            )}>
              Micro Session
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">5-15 minutes</p>
          </button>

          <button
            onClick={() => {
              setSelectedMode('deep');
              setSelectedDuration(30);
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              selectedMode === 'deep'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
            )}
          >
            <BookOpen
              className={cn(
                'mx-auto mb-2',
                selectedMode === 'deep' ? 'text-orange-500' : 'text-gray-400'
              )}
              size={24}
            />
            <p className={cn(
              'font-semibold',
              selectedMode === 'deep' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
            )}>
              Deep Session
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">30+ minutes</p>
          </button>
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Duration
        </h2>
        <div className="flex gap-3">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={cn(
                'flex-1 py-3 rounded-lg font-semibold transition-colors',
                selectedDuration === duration
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {duration} min
            </button>
          ))}
        </div>
      </div>

      {/* Deck Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Select Deck
        </h2>
        {decks.length === 0 ? (
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No decks available. Import a deck to start studying.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {decks.map((deck) => {
              const stats = deckStats[deck.id];
              const isSelected = selectedDeckId === deck.id;
              const dueCount = stats?.dueToday ?? 0;
              const newCount = stats?.newCards ?? 0;

              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all text-left',
                    isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  )}
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {deck.name}
                    </p>
                    <div className="flex gap-3 mt-1">
                      {dueCount > 0 && (
                        <span className="text-sm px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                          {dueCount} due
                        </span>
                      )}
                      {newCount > 0 && (
                        <span className="text-sm px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                          {newCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartSession}
        disabled={!selectedDeckId}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
      >
        Start Learning
      </button>
    </div>
  );
}
