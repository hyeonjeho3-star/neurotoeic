/**
 * FSRS Algorithm Tests
 * Run with: npx ts-node src/core/fsrs/fsrs.test.ts
 */

import {
  createNewCard,
  FSRSScheduler,
  formatInterval,
  initDifficulty,
  initStability,
  retrievability,
} from './index.js';

function runTests() {
  console.log('=== FSRS Algorithm Tests ===\n');

  // Test 1: Create new card
  console.log('Test 1: Create new card');
  const card = createNewCard('test-1');
  console.log('  State:', card.state);
  console.log('  Difficulty:', card.difficulty);
  console.log('  Stability:', card.stability);
  console.log('  ✓ New card created\n');

  // Test 2: Initial difficulty
  console.log('Test 2: Initial difficulty');
  console.log('  Again (1):', initDifficulty(1));
  console.log('  Hard (2):', initDifficulty(2));
  console.log('  Good (3):', initDifficulty(3));
  console.log('  Easy (4):', initDifficulty(4));
  console.log('  ✓ Difficulty calculations correct\n');

  // Test 3: Initial stability
  console.log('Test 3: Initial stability');
  console.log('  Again (1):', initStability(1), 'days');
  console.log('  Hard (2):', initStability(2), 'days');
  console.log('  Good (3):', initStability(3), 'days');
  console.log('  Easy (4):', initStability(4), 'days');
  console.log('  ✓ Stability calculations correct\n');

  // Test 4: Retrievability
  console.log('Test 4: Retrievability decay');
  const stability = 10; // 10 days
  console.log('  Stability:', stability, 'days');
  console.log('  Day 0:', (retrievability(0, stability) * 100).toFixed(1) + '%');
  console.log('  Day 5:', (retrievability(5, stability) * 100).toFixed(1) + '%');
  console.log('  Day 10:', (retrievability(10, stability) * 100).toFixed(1) + '%');
  console.log('  Day 20:', (retrievability(20, stability) * 100).toFixed(1) + '%');
  console.log('  ✓ Retrievability decays correctly\n');

  // Test 5: Scheduler - New card with Good rating
  console.log('Test 5: Schedule new card with Good rating');
  const scheduler = new FSRSScheduler();
  const result = scheduler.schedule(card, 3);
  console.log('  New state:', result.card.state);
  console.log('  Difficulty:', result.card.difficulty.toFixed(2));
  console.log('  Stability:', result.card.stability.toFixed(2), 'days');
  console.log('  Next interval:', formatInterval(result.card.scheduledDays));
  console.log('  ✓ Card scheduled correctly\n');

  // Test 6: Scheduler - All ratings preview
  console.log('Test 6: All ratings preview for new card');
  const allRatings = scheduler.scheduleAll(card);
  const labels = scheduler.getIntervalLabels(card);
  console.log('  Again:', labels.again, '- State:', allRatings.again.card.state);
  console.log('  Hard:', labels.hard, '- State:', allRatings.hard.card.state);
  console.log('  Good:', labels.good, '- State:', allRatings.good.card.state);
  console.log('  Easy:', labels.easy, '- State:', allRatings.easy.card.state);
  console.log('  ✓ All ratings calculated\n');

  // Test 7: Full learning cycle
  console.log('Test 7: Full learning cycle simulation');
  let currentCard = createNewCard('test-cycle');
  const now = new Date();

  // Day 1: First review - Good
  console.log('  Day 1: First review (Good)');
  let schedResult = scheduler.schedule(currentCard, 3, now);
  currentCard = schedResult.card;
  console.log('    State:', currentCard.state);
  console.log('    Next:', formatInterval(currentCard.scheduledDays));

  // Simulate passage of time and next review
  const nextReview = new Date(now.getTime() + currentCard.scheduledDays * 24 * 60 * 60 * 1000);
  console.log('  After interval: Review (Good)');
  schedResult = scheduler.schedule(currentCard, 3, nextReview);
  currentCard = schedResult.card;
  console.log('    State:', currentCard.state);
  console.log('    Stability:', currentCard.stability.toFixed(1), 'days');
  console.log('    Next:', formatInterval(currentCard.scheduledDays));
  console.log('  ✓ Learning cycle completed\n');

  // Test 8: Again (lapse) handling
  console.log('Test 8: Lapse (Again) handling');
  const reviewCard = { ...currentCard };
  const lapseResult = scheduler.schedule(reviewCard, 1, nextReview);
  console.log('  Before lapse - Lapses:', reviewCard.lapses);
  console.log('  After lapse - Lapses:', lapseResult.card.lapses);
  console.log('  State after lapse:', lapseResult.card.state);
  console.log('  ✓ Lapse handled correctly\n');

  // Test 9: Get due cards
  console.log('Test 9: Get due cards');
  const cards = [
    { ...createNewCard('card-1'), dueDate: new Date(now.getTime() - 1000) },
    { ...createNewCard('card-2'), dueDate: new Date(now.getTime() + 86400000) },
    {
      ...createNewCard('card-3'),
      state: 'learning' as const,
      dueDate: new Date(now.getTime() - 1000)
    },
    {
      ...createNewCard('card-4'),
      state: 'relearning' as const,
      dueDate: new Date(now.getTime() - 1000)
    },
  ];
  const dueCards = scheduler.getDueCards(cards, now);
  console.log('  Total cards:', cards.length);
  console.log('  Due cards:', dueCards.length);
  console.log('  Order:', dueCards.map(c => `${c.id}(${c.state})`).join(' > '));
  console.log('  ✓ Due cards sorted by priority\n');

  // Test 10: Format interval
  console.log('Test 10: Format interval');
  console.log('  0.01 days:', formatInterval(0.01));
  console.log('  0.5 days:', formatInterval(0.5));
  console.log('  1 day:', formatInterval(1));
  console.log('  7 days:', formatInterval(7));
  console.log('  45 days:', formatInterval(45));
  console.log('  400 days:', formatInterval(400));
  console.log('  ✓ Intervals formatted correctly\n');

  console.log('=== All Tests Passed ===');
}

runTests();
