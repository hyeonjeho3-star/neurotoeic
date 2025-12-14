/**
 * Markdown Card File Parser
 *
 * Supports multiple formats:
 *
 * Format 1 - Cloze (Simple):
 * # Deck Title
 * tags: tag1, tag2
 * ---
 * Sentence with {{c1::answer::hint}} cloze.
 * |trap: option1, option2
 *
 * Format 2 - Q&A:
 * # Deck Title
 * tags: tag1, tag2
 * ---
 * Q: Question
 * A: Answer
 *
 * Format 3 - Structured (Original):
 * ---
 * deck: Deck Name
 * tags: [tag1, tag2]
 * ---
 * # Card Title
 * ## front
 * Question
 * ## back
 * Answer
 */

import type { ParsedCard, ParsedDeck, ParseResult, ParseError } from './types';
import { extractClozes } from './cloze';

interface DeckMeta {
  name?: string;
  tags: string[];
  description?: string;
}

/**
 * Parse deck metadata from the beginning of the file
 * Supports both "# Title\ntags: ..." and YAML front matter
 */
function parseDeckMeta(content: string): { meta: DeckMeta; body: string } {
  const lines = content.split('\n');
  const meta: DeckMeta = { tags: [] };
  let bodyStartIndex = 0;

  // Check for YAML front matter (---\n...\n---)
  if (lines[0]?.trim() === '---') {
    const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
    if (endIndex > 0) {
      // Parse YAML front matter
      for (let i = 1; i < endIndex; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const value = line.slice(colonIndex + 1).trim();

        if (key === 'deck' || key === 'name' || key === 'title') {
          meta.name = value;
        } else if (key === 'description') {
          meta.description = value;
        } else if (key === 'tags') {
          const tagsMatch = value.match(/\[(.*)\]/);
          if (tagsMatch) {
            meta.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
          } else {
            meta.tags = value.split(',').map(t => t.trim()).filter(Boolean);
          }
        }
      }
      bodyStartIndex = endIndex + 1;
    }
  }

  // Check for "# Title" format (non-YAML)
  const remainingLines = lines.slice(bodyStartIndex);
  for (let i = 0; i < remainingLines.length; i++) {
    const line = remainingLines[i].trim();

    // Stop at separator
    if (line === '---') {
      bodyStartIndex += i + 1;
      break;
    }

    // Parse title (# Deck Title)
    if (line.startsWith('# ') && !meta.name) {
      meta.name = line.slice(2).trim();
      continue;
    }

    // Parse tags line
    if (line.toLowerCase().startsWith('tags:')) {
      const tagsValue = line.slice(5).trim();
      meta.tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean);
      continue;
    }

    // Parse description
    if (line.toLowerCase().startsWith('description:')) {
      meta.description = line.slice(12).trim();
      continue;
    }

    // Skip empty lines in header
    if (line === '') continue;

    // If we hit content that's not metadata, treat as body
    if (!line.startsWith('#') && !line.toLowerCase().startsWith('tags:') &&
        !line.toLowerCase().startsWith('description:') && line !== '') {
      bodyStartIndex += i;
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim();
  return { meta, body };
}

/**
 * Parse cards from body content
 * Supports cloze format, Q&A format, line-based pipe format, and structured format
 */
function parseCards(body: string, errors: ParseError[]): ParsedCard[] {
  const cards: ParsedCard[] = [];

  // First, check if the body is line-based pipe format (most lines contain |)
  const allLines = body.split('\n').filter(line => line.trim() && line.trim() !== '---');
  const pipeLineCount = allLines.filter(line => line.includes('|') && !line.startsWith('|')).length;

  // If more than half of non-empty lines have pipes, treat as line-based format
  if (pipeLineCount > allLines.length * 0.5) {
    for (const line of allLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === '---') continue;

      // Simple pipe format: front | back
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('|')) {
        const pipeIndex = trimmedLine.indexOf('|');
        const front = trimmedLine.slice(0, pipeIndex).trim();
        const back = trimmedLine.slice(pipeIndex + 1).trim();
        if (front && back) {
          cards.push({
            front,
            back,
            clozes: [],
            trapOptions: [],
            tags: [],
          });
        }
      }
    }
    return cards;
  }

  // Split by empty lines or --- separators for card boundaries
  const blocks = body.split(/\n\s*\n/).filter(b => b.trim() && b.trim() !== '---');

  for (const block of blocks) {
    const trimmedBlock = block.trim();

    // Skip separators
    if (trimmedBlock === '---') continue;

    // Check for Q&A format
    if (trimmedBlock.startsWith('Q:') || trimmedBlock.startsWith('q:')) {
      const lines = trimmedBlock.split('\n');
      let question = '';
      let answer = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('q:')) {
          question = trimmedLine.slice(2).trim();
        } else if (trimmedLine.toLowerCase().startsWith('a:')) {
          answer = trimmedLine.slice(2).trim();
        }
      }

      if (question && answer) {
        cards.push({
          front: question,
          back: answer,
          clozes: [],
          trapOptions: [],
          tags: [],
        });
      }
      continue;
    }

    // Check for structured format (## front / ## back)
    if (trimmedBlock.includes('## front') || trimmedBlock.includes('## Front')) {
      const card = parseStructuredCard(trimmedBlock, errors);
      if (card) {
        cards.push(card);
      }
      continue;
    }

    // Cloze format: sentence with {{c1::answer::hint}} and optional |trap:
    if (trimmedBlock.includes('{{c')) {
      const lines = trimmedBlock.split('\n');
      let front = '';
      let trapOptions: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('|trap:') || trimmedLine.startsWith('| trap:')) {
          const trapValue = trimmedLine.replace(/^\|?\s*trap:\s*/i, '');
          trapOptions = trapValue.split(',').map(t => t.trim()).filter(Boolean);
        } else if (trimmedLine) {
          front = trimmedLine;
        }
      }

      if (front) {
        const clozes = extractClozes(front);
        cards.push({
          front,
          back: clozes.map(c => c.answer).join(', '),
          clozes,
          trapOptions,
          tags: [],
        });
      }
      continue;
    }

    // Simple pipe format: front | back (single block)
    if (trimmedBlock.includes('|') && !trimmedBlock.startsWith('|')) {
      const pipeIndex = trimmedBlock.indexOf('|');
      const front = trimmedBlock.slice(0, pipeIndex).trim();
      const back = trimmedBlock.slice(pipeIndex + 1).trim();
      if (front && back) {
        cards.push({
          front,
          back,
          clozes: [],
          trapOptions: [],
          tags: [],
        });
      }
      continue;
    }
  }

  return cards;
}

/**
 * Parse a structured card block with ## front / ## back sections
 */
function parseStructuredCard(block: string, errors: ParseError[]): ParsedCard | null {
  const card: Partial<ParsedCard> = {
    tags: [],
    trapOptions: [],
    clozes: [],
  };

  // Extract title (# heading)
  const titleMatch = block.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    card.title = titleMatch[1].trim();
  }

  // Extract front section
  const frontMatch = block.match(/##\s*front\s*\n([\s\S]*?)(?=##|$)/i);
  if (frontMatch) {
    card.front = frontMatch[1].trim();
    card.clozes = extractClozes(card.front);
  } else {
    errors.push({
      message: `Card missing "## front" section${card.title ? ` (${card.title})` : ''}`,
      severity: 'error',
    });
    return null;
  }

  // Extract back section
  const backMatch = block.match(/##\s*back\s*\n([\s\S]*?)(?=##|$)/i);
  if (backMatch) {
    card.back = backMatch[1].trim();
  } else {
    card.back = '';
  }

  // Extract trap options section
  const trapMatch = block.match(/##\s*trap_options?\s*\n([\s\S]*?)(?=##|$)/i);
  if (trapMatch) {
    const trapContent = trapMatch[1].trim();
    const items = trapContent.match(/^[-*]\s*(.+)$/gm);
    if (items) {
      card.trapOptions = items.map(item =>
        item.replace(/^[-*]\s*/, '').trim()
      );
    } else {
      card.trapOptions = trapContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  }

  // Extract tags
  const tagsMatch = block.match(/tags:\s*\[(.*)\]/i);
  if (tagsMatch) {
    card.tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  return card as ParsedCard;
}

/**
 * Parse a complete markdown deck file
 */
export function parseMarkdown(content: string, sourceFile?: string): ParseResult {
  const errors: ParseError[] = [];

  // Parse metadata
  const { meta, body } = parseDeckMeta(content);

  // Validate deck name
  if (!meta.name) {
    // Use filename as fallback
    if (sourceFile) {
      meta.name = sourceFile.replace(/\.(md|markdown)$/i, '').split('/').pop() || 'Untitled Deck';
    } else {
      meta.name = 'Untitled Deck';
    }
    errors.push({
      message: 'No deck name found. Using filename or "Untitled Deck".',
      severity: 'warning',
    });
  }

  // Parse cards
  const cards = parseCards(body, errors);

  if (cards.length === 0) {
    errors.push({
      message: 'No cards found in file. Check the file format.',
      severity: 'error',
    });
    return { success: false, errors };
  }

  // Apply deck-level tags to cards without tags
  for (const card of cards) {
    if (card.tags.length === 0 && meta.tags.length > 0) {
      card.tags = [...meta.tags];
    }
  }

  const deck: ParsedDeck = {
    name: meta.name,
    description: meta.description,
    tags: meta.tags,
    cards,
    sourceFile,
  };

  return {
    success: true,
    deck,
    errors,
  };
}
