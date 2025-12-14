'use client';

import { cn } from '@/lib/utils';
import type { Rating } from '@/lib/fsrs';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  intervals: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
  disabled?: boolean;
}

const RATING_CONFIG: {
  rating: Rating;
  label: string;
  key: 'again' | 'hard' | 'good' | 'easy';
  color: string;
  hoverColor: string;
}[] = [
  {
    rating: 1,
    label: 'Again',
    key: 'again',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  {
    rating: 2,
    label: 'Hard',
    key: 'hard',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  {
    rating: 3,
    label: 'Good',
    key: 'good',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  {
    rating: 4,
    label: 'Easy',
    key: 'easy',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
];

export function RatingButtons({ onRate, intervals, disabled }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 px-4">
      {RATING_CONFIG.map((config) => (
        <button
          key={config.rating}
          onClick={() => onRate(config.rating)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center justify-center py-3 px-2 rounded-lg text-white transition-all',
            config.color,
            config.hoverColor,
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'active:scale-95'
          )}
        >
          <span className="font-semibold text-sm">{config.label}</span>
          <span className="text-xs opacity-80 mt-0.5">
            {intervals[config.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
