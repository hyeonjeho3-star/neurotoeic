'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ClozeItem } from '@/lib/db';
import { extractClozes } from '@/lib/parser/cloze';

interface ClozeRendererProps {
  text: string;
  clozes?: ClozeItem[];
  revealedIndexes?: number[];
  showBlanks?: boolean;
  onClozePress?: (index: number) => void;
}

export function ClozeRenderer({
  text,
  clozes: providedClozes,
  revealedIndexes = [],
  showBlanks = true,
  onClozePress,
}: ClozeRendererProps) {
  const clozes = useMemo(
    () => providedClozes ?? extractClozes(text),
    [providedClozes, text]
  );

  const revealedSet = useMemo(() => new Set(revealedIndexes), [revealedIndexes]);

  const segments = useMemo(() => {
    const result: Array<{
      type: 'text' | 'cloze';
      content: string;
      cloze?: ClozeItem;
      revealed?: boolean;
    }> = [];

    let lastIndex = 0;
    const sortedClozes = [...clozes].sort((a, b) => a.start - b.start);

    for (const cloze of sortedClozes) {
      if (cloze.start > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, cloze.start),
        });
      }

      const isRevealed = revealedSet.has(cloze.index);
      result.push({
        type: 'cloze',
        content: isRevealed
          ? cloze.answer
          : cloze.hint
          ? `[${cloze.hint}]`
          : showBlanks
          ? '[___]'
          : `[${cloze.index}]`,
        cloze,
        revealed: isRevealed,
      });

      lastIndex = cloze.end;
    }

    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    // Clean up cloze markers from text segments
    return result.map((seg) => {
      if (seg.type === 'text') {
        let content = seg.content;
        content = content.replace(/\{\{c\d+::.*?\}\}/g, '');
        content = content.replace(/\{\{.*?\}\}/g, '');
        return { ...seg, content };
      }
      return seg;
    });
  }, [text, clozes, revealedSet, showBlanks]);

  return (
    <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }

        const isRevealed = segment.revealed;
        const isClickable = onClozePress && !isRevealed;

        return (
          <span
            key={index}
            onClick={isClickable ? () => onClozePress(segment.cloze!.index) : undefined}
            className={cn(
              'px-2 py-0.5 rounded font-semibold inline-block',
              isRevealed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              isClickable && 'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50'
            )}
          >
            {segment.content}
          </span>
        );
      })}
    </p>
  );
}
