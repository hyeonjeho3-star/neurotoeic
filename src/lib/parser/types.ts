/**
 * Card Parser Type Definitions
 */

/** Single cloze deletion item */
export interface ClozeItem {
  /** Cloze index (1-based, from {{c1::...}}) */
  index: number;
  /** The correct answer */
  answer: string;
  /** Optional hint shown instead of blank */
  hint?: string;
  /** Start position in original text */
  start: number;
  /** End position in original text */
  end: number;
}

/** Parsed card from file */
export interface ParsedCard {
  /** Optional card title/identifier */
  title?: string;
  /** Front of card (with cloze markers) */
  front: string;
  /** Back of card (answer + explanation) */
  back: string;
  /** Extracted cloze items */
  clozes: ClozeItem[];
  /** Trap/distractor options for multiple choice */
  trapOptions: string[];
  /** Card-specific tags */
  tags: string[];
}

/** Parsed deck from file */
export interface ParsedDeck {
  /** Deck name */
  name: string;
  /** Optional description */
  description?: string;
  /** Deck-level tags */
  tags: string[];
  /** Parsed cards */
  cards: ParsedCard[];
  /** Source file name */
  sourceFile?: string;
}

/** Parse result with potential errors */
export interface ParseResult {
  success: boolean;
  deck?: ParsedDeck;
  errors: ParseError[];
}

/** Parse error details */
export interface ParseError {
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}
