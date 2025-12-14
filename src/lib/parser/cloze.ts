/**
 * Cloze Deletion Parser and Renderer
 *
 * Supported formats:
 * - {{c1::answer}} - Indexed cloze
 * - {{c1::answer::hint}} - Indexed cloze with hint
 * - {{answer}} - Auto-indexed cloze
 * - {{answer::hint}} - Auto-indexed with hint
 */

import type { ClozeItem } from './types';

// Regex patterns for cloze detection
const INDEXED_CLOZE_REGEX = /\{\{c(\d+)::([^}:]+)(?:::([^}]+))?\}\}/g;
const SIMPLE_CLOZE_REGEX = /\{\{([^}:]+)(?:::([^}]+))?\}\}/g;

/**
 * Extract all cloze items from text
 */
export function extractClozes(text: string): ClozeItem[] {
  const clozes: ClozeItem[] = [];
  let autoIndex = 1;

  // First, handle indexed clozes {{c1::...}}
  const indexedMatches = [...text.matchAll(INDEXED_CLOZE_REGEX)];
  for (const match of indexedMatches) {
    const [fullMatch, indexStr, answer, hint] = match;
    clozes.push({
      index: parseInt(indexStr, 10),
      answer: answer.trim(),
      hint: hint?.trim(),
      start: match.index!,
      end: match.index! + fullMatch.length,
    });
  }

  // Then handle simple clozes {{...}} that aren't indexed
  // Need to find matches that don't have 'c\d::' pattern
  const simplePattern = /\{\{(?!c\d+::)([^}:]+)(?:::([^}]+))?\}\}/g;
  const simpleMatches = [...text.matchAll(simplePattern)];

  for (const match of simpleMatches) {
    const [fullMatch, answer, hint] = match;
    // Find next available index
    while (clozes.some(c => c.index === autoIndex)) {
      autoIndex++;
    }
    clozes.push({
      index: autoIndex++,
      answer: answer.trim(),
      hint: hint?.trim(),
      start: match.index!,
      end: match.index! + fullMatch.length,
    });
  }

  // Sort by position
  return clozes.sort((a, b) => a.start - b.start);
}

/**
 * Render text with cloze blanks for display
 * @param text Original text with cloze markers
 * @param showIndex Whether to show cloze index in blank
 * @returns Text with [___] or [1] style blanks
 */
export function renderClozeBlank(text: string, showIndex: boolean = true): string {
  // Replace indexed clozes
  let result = text.replace(INDEXED_CLOZE_REGEX, (_, index, _answer, hint) => {
    if (hint) {
      return `[${hint}]`;
    }
    return showIndex ? `[${index}]` : '[___]';
  });

  // Replace simple clozes
  let autoIndex = 1;
  result = result.replace(/\{\{(?!c\d+::)([^}:]+)(?:::([^}]+))?\}\}/g, (_, _answer, hint) => {
    if (hint) {
      return `[${hint}]`;
    }
    return showIndex ? `[${autoIndex++}]` : '[___]';
  });

  return result;
}

/**
 * Render text with specific clozes revealed
 * @param text Original text with cloze markers
 * @param revealIndexes Indexes of clozes to reveal (show answer)
 * @returns Text with revealed answers highlighted
 */
export function renderPartialCloze(text: string, revealIndexes: number[]): string {
  const revealSet = new Set(revealIndexes);

  // Handle indexed clozes
  let result = text.replace(INDEXED_CLOZE_REGEX, (fullMatch, index, answer, hint) => {
    const idx = parseInt(index, 10);
    if (revealSet.has(idx)) {
      return `**${answer}**`;
    }
    if (hint) {
      return `[${hint}]`;
    }
    return `[${index}]`;
  });

  // Handle simple clozes
  let autoIndex = 1;
  result = result.replace(/\{\{(?!c\d+::)([^}:]+)(?:::([^}]+))?\}\}/g, (_, answer, hint) => {
    const currentIdx = autoIndex++;
    if (revealSet.has(currentIdx)) {
      return `**${answer}**`;
    }
    if (hint) {
      return `[${hint}]`;
    }
    return `[${currentIdx}]`;
  });

  return result;
}

/**
 * Render text with all clozes revealed (for answer display)
 */
export function renderAllRevealed(text: string): string {
  // Handle indexed clozes
  let result = text.replace(INDEXED_CLOZE_REGEX, (_, _index, answer) => {
    return `**${answer}**`;
  });

  // Handle simple clozes
  result = result.replace(/\{\{(?!c\d+::)([^}:]+)(?:::([^}]+))?\}\}/g, (_, answer) => {
    return `**${answer}**`;
  });

  return result;
}

/**
 * Get the answer for a specific cloze index
 */
export function getClozeAnswer(text: string, index: number): string | null {
  const clozes = extractClozes(text);
  const cloze = clozes.find(c => c.index === index);
  return cloze?.answer ?? null;
}

/**
 * Check if text contains any cloze markers
 */
export function hasCloze(text: string): boolean {
  return INDEXED_CLOZE_REGEX.test(text) ||
    /\{\{(?!c\d+::)[^}]+\}\}/.test(text);
}

/**
 * Count cloze deletions in text
 */
export function countClozes(text: string): number {
  return extractClozes(text).length;
}
