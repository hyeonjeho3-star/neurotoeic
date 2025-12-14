/**
 * Text Card File Parser
 *
 * Parses .txt files with the following structure:
 *
 * [DECK] Deck Name
 * [TAGS] tag1, tag2
 * [DESC] Optional description
 *
 * Q: Question with {{answer}} deletions
 * A: Answer and explanation
 * T: trap1 | trap2 | trap3
 *
 * ---
 *
 * Q: Next question...
 */

import type { ParsedCard, ParsedDeck, ParseResult, ParseError } from './types';
import { extractClozes } from './cloze';

interface TextMeta {
  deck?: string;
  tags?: string[];
  description?: string;
}

/**
 * Parse metadata lines from text content
 */
function parseMetadata(content: string): { meta: TextMeta; body: string } {
  const meta: TextMeta = {};
  const lines = content.split('\n');
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('[DECK]')) {
      meta.deck = line.slice(6).trim();
      bodyStartIndex = i + 1;
    } else if (line.startsWith('[TAGS]')) {
      meta.tags = line
        .slice(6)
        .trim()
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      bodyStartIndex = i + 1;
    } else if (line.startsWith('[DESC]')) {
      meta.description = line.slice(6).trim();
      bodyStartIndex = i + 1;
    } else if (line.length > 0 && !line.startsWith('[')) {
      // First non-metadata line
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join('\n');
  return { meta, body };
}

/**
 * Split content into card blocks
 */
function splitIntoCards(body: string): string[] {
  // Split by --- or empty lines followed by Q:
  const parts = body.split(/\n---+\s*\n|\n\s*\n(?=Q:)/);
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * Parse a single card block
 */
function parseCardBlock(block: string, errors: ParseError[]): ParsedCard | null {
  const card: Partial<ParsedCard> = {
    tags: [],
    trapOptions: [],
    clozes: [],
  };

  const lines = block.split('\n');

  let front = '';
  let back = '';
  let trapLine = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('Q:')) {
      front = trimmed.slice(2).trim();
    } else if (trimmed.startsWith('A:')) {
      back = trimmed.slice(2).trim();
    } else if (trimmed.startsWith('T:')) {
      trapLine = trimmed.slice(2).trim();
    } else if (front && !back && trimmed.length > 0) {
      // Continue front (multi-line question)
      front += ' ' + trimmed;
    } else if (back && !trapLine && trimmed.length > 0 && !trimmed.startsWith('T:')) {
      // Continue back (multi-line answer)
      back += ' ' + trimmed;
    }
  }

  if (!front) {
    errors.push({
      message: 'Card missing "Q:" (question) line',
      severity: 'error',
    });
    return null;
  }

  card.front = front;
  card.clozes = extractClozes(front);
  card.back = back || '';

  // Parse trap options (pipe-separated)
  if (trapLine) {
    card.trapOptions = trapLine
      .split('|')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  return card as ParsedCard;
}

/**
 * Parse a complete text deck file
 */
export function parseText(content: string, sourceFile?: string): ParseResult {
  const errors: ParseError[] = [];

  // Parse metadata
  const { meta, body } = parseMetadata(content);

  // Validate deck name
  if (!meta.deck) {
    errors.push({
      message: 'Missing deck name. Add "[DECK] Your Deck Name" at the start',
      severity: 'warning',
    });
  }

  // Split into card blocks
  const cardBlocks = splitIntoCards(body);

  if (cardBlocks.length === 0) {
    errors.push({
      message: 'No cards found in file. Cards should start with "Q:"',
      severity: 'error',
    });
    return { success: false, errors };
  }

  // Parse each card
  const cards: ParsedCard[] = [];
  for (const block of cardBlocks) {
    const card = parseCardBlock(block, errors);
    if (card) {
      // Inherit deck-level tags
      if (card.tags.length === 0 && meta.tags) {
        card.tags = [...meta.tags];
      }
      cards.push(card);
    }
  }

  if (cards.length === 0) {
    errors.push({
      message: 'No valid cards parsed from file',
      severity: 'error',
    });
    return { success: false, errors };
  }

  const deck: ParsedDeck = {
    name: meta.deck || 'Untitled Deck',
    description: meta.description,
    tags: meta.tags || [],
    cards,
    sourceFile,
  };

  return {
    success: true,
    deck,
    errors,
  };
}
