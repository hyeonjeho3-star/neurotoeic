'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Card } from '@/lib/db';
import { ClozeRenderer } from './ClozeRenderer';

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div
      className="perspective-1000 w-full max-w-lg mx-auto h-80 cursor-pointer"
      onClick={onFlip}
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-500 transform-style-3d',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Question
          </span>
          <div className="flex-1 flex items-center justify-center">
            <ClozeRenderer
              text={card.front}
              clozes={card.clozes}
              showBlanks
            />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-4">
            Tap to reveal answer
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col overflow-auto">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Answer
          </span>
          <div className="flex-1">
            <ClozeRenderer
              text={card.front}
              clozes={card.clozes}
              revealedIndexes={card.clozes.map((c) => c.index)}
            />
            {card.back && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Explanation
                </span>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {card.back}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
