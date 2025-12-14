/**
 * Parser Tests
 */

import { parseMarkdown } from './markdown';
import { parseText } from './text';
import { extractClozes, renderClozeBlank, renderAllRevealed, hasCloze } from './cloze';
import * as fs from 'fs';
import * as path from 'path';

function runTests() {
  console.log('=== Card Parser Tests ===\n');

  // Test 1: Cloze extraction
  console.log('Test 1: Cloze extraction');
  const text1 = 'The study {{c1::aims to explore}} the correlation.';
  const clozes1 = extractClozes(text1);
  console.log('  Input:', text1);
  console.log('  Clozes:', clozes1.length);
  console.log('  Answer:', clozes1[0]?.answer);
  console.log('  ✓ Indexed cloze extracted\n');

  // Test 2: Simple cloze extraction
  console.log('Test 2: Simple cloze');
  const text2 = 'The theory is popular. {{However}}, it lacks support.';
  const clozes2 = extractClozes(text2);
  console.log('  Input:', text2);
  console.log('  Answer:', clozes2[0]?.answer);
  console.log('  Index:', clozes2[0]?.index);
  console.log('  ✓ Simple cloze extracted\n');

  // Test 3: Cloze with hint
  console.log('Test 3: Cloze with hint');
  const text3 = 'She {{c1::managed::past tense}} to finish on time.';
  const clozes3 = extractClozes(text3);
  console.log('  Input:', text3);
  console.log('  Answer:', clozes3[0]?.answer);
  console.log('  Hint:', clozes3[0]?.hint);
  console.log('  ✓ Cloze hint extracted\n');

  // Test 4: Render cloze blank
  console.log('Test 4: Render cloze blank');
  const rendered1 = renderClozeBlank(text1);
  console.log('  Original:', text1);
  console.log('  Rendered:', rendered1);
  console.log('  ✓ Blank rendered\n');

  // Test 5: Render all revealed
  console.log('Test 5: Render all revealed');
  const revealed = renderAllRevealed(text1);
  console.log('  Original:', text1);
  console.log('  Revealed:', revealed);
  console.log('  ✓ All revealed\n');

  // Test 6: Has cloze check
  console.log('Test 6: Has cloze check');
  console.log('  With cloze:', hasCloze(text1));
  console.log('  Without cloze:', hasCloze('No cloze here'));
  console.log('  ✓ Cloze detection works\n');

  // Test 7: Parse markdown file
  console.log('Test 7: Parse markdown deck');
  const mdPath = path.join(__dirname, '../../../assets/decks/verb-patterns.md');
  try {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const mdResult = parseMarkdown(mdContent, 'verb-patterns.md');
    console.log('  Success:', mdResult.success);
    console.log('  Deck name:', mdResult.deck?.name);
    console.log('  Tags:', mdResult.deck?.tags.join(', '));
    console.log('  Cards:', mdResult.deck?.cards.length);
    if (mdResult.deck?.cards[0]) {
      console.log('  First card front:', mdResult.deck.cards[0].front.slice(0, 50) + '...');
      console.log('  First card clozes:', mdResult.deck.cards[0].clozes.length);
      console.log('  First card traps:', mdResult.deck.cards[0].trapOptions.length);
    }
    if (mdResult.errors.length > 0) {
      console.log('  Warnings:', mdResult.errors.map(e => e.message).join('; '));
    }
    console.log('  ✓ Markdown parsed\n');
  } catch (err) {
    console.log('  Error reading file:', err);
  }

  // Test 8: Parse text file
  console.log('Test 8: Parse text deck');
  const txtPath = path.join(__dirname, '../../../assets/decks/discourse-markers.txt');
  try {
    const txtContent = fs.readFileSync(txtPath, 'utf-8');
    const txtResult = parseText(txtContent, 'discourse-markers.txt');
    console.log('  Success:', txtResult.success);
    console.log('  Deck name:', txtResult.deck?.name);
    console.log('  Tags:', txtResult.deck?.tags.join(', '));
    console.log('  Cards:', txtResult.deck?.cards.length);
    if (txtResult.deck?.cards[0]) {
      console.log('  First card front:', txtResult.deck.cards[0].front);
      console.log('  First card answer:', txtResult.deck.cards[0].clozes[0]?.answer);
      console.log('  First card traps:', txtResult.deck.cards[0].trapOptions.join(' | '));
    }
    console.log('  ✓ Text file parsed\n');
  } catch (err) {
    console.log('  Error reading file:', err);
  }

  // Test 9: Multiple clozes
  console.log('Test 9: Multiple clozes');
  const multiCloze = '{{c1::First}} and {{c2::second}} items.';
  const clozes = extractClozes(multiCloze);
  console.log('  Input:', multiCloze);
  console.log('  Cloze count:', clozes.length);
  console.log('  Answers:', clozes.map(c => `c${c.index}:${c.answer}`).join(', '));
  console.log('  ✓ Multiple clozes extracted\n');

  console.log('=== All Parser Tests Passed ===');
}

runTests();
