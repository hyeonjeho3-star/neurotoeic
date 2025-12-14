/**
 * Card Parser Module
 *
 * Supports parsing .md and .txt card files
 */

export * from './types';
export * from './cloze';
export { parseMarkdown } from './markdown';
export { parseText } from './text';

import { parseMarkdown } from './markdown';
import { parseText } from './text';
import type { ParseResult } from './types';

/**
 * Parse a card file based on extension
 */
export function parseFile(content: string, filename: string): ParseResult {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'md' || ext === 'markdown') {
    return parseMarkdown(content, filename);
  }

  if (ext === 'txt') {
    return parseText(content, filename);
  }

  return {
    success: false,
    errors: [{
      message: `Unsupported file extension: .${ext}. Use .md or .txt`,
      severity: 'error',
    }],
  };
}

/**
 * Detect file type from content
 */
export function detectFileType(content: string): 'markdown' | 'text' | 'unknown' {
  // Check for markdown front matter
  if (content.trim().startsWith('---')) {
    return 'markdown';
  }

  // Check for text metadata
  if (content.includes('[DECK]') || content.match(/^Q:/m)) {
    return 'text';
  }

  // Check for markdown sections
  if (content.includes('## front') || content.includes('## back')) {
    return 'markdown';
  }

  return 'unknown';
}
