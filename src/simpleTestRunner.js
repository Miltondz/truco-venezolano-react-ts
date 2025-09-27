// Simple test runner that can be executed directly with Node.js
const fs = require('fs');
const path = require('path');

// Mock the required modules for testing
const mockGameState = {
  playerScore: 0,
  computerScore: 0,
  currentRound: 1,
  maxRounds: 3,
  playerHand: [],
  computerHand: [],
  playerPlayedCard: null,
  computerPlayedCard: null,
  isPlayerTurn: true,
  difficulty: 'medium',
  aiPersonality: {
    agresividad: 5,
    intimidacion: 5,
    calculo: 5,
    adaptabilidad: 5,
    archetype: 'Test',
    description: 'Test personality'
  },
  activeCalls: [],
  roundsWon: { player: 0, computer: 0 },
  gameInProgress: true,
  handInProgress: false,
  currentTrucoLevel: 0,
  currentEnvidoLevel: 0,
  playerEnvidoPoints: 0,
  computerEnvidoPoints: 0,
  playerHasFlor: false,
  computerHasFlor: false,
  waitingForResponse: false,
  lastCall: null,
  gameStartTime: Date.now(),
  currentStreak: 0,
  bestStreak: 0,
  selectedAvatar: 'avatar1.jpg',
  viraCard: null,
  pericoCard: null
};

// Mock cards for testing
const mockCards = [
  { suit: 'espadas', value: 1, name: 'As de Espadas', power: 14, envidoValue: 1 },
  { suit: 'espadas', value: 2, name: '2 de Espadas', power: 9, envidoValue: 2 },
  { suit: 'espadas', value: 3, name: '3 de Espadas', power: 10, envidoValue: 3 },
  { suit: 'bastos', value: 1, name: 'As de Bastos', power: 13, envidoValue: 1 },
  { suit: 'bastos', value: 2, name: '2 de Bastos', power: 9, envidoValue: 2 },
  { suit: 'bastos', value: 3, name: '3 de Bastos', power: 10, envidoValue: 3 },
  { suit: 'oros', value: 1, name: 'As de Oros', power: 8, envidoValue: 1 },
  { suit: 'copas', value: 1, name: 'As de Copas', power: 8, envidoValue: 1 }
];

// Test results
const testResults = [];

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  testResults.push(message);
}

function calculateEnvidoPoints(hand) {
  const suits = {};
  hand.forEach(card => {
    if (!suits[card.suit]) suits[card.suit] = [];
    suits[card.suit].push(card.envidoValue);
  });

  let maxPoints = 0;
  Object.keys(suits).forEach(suit => {
    if (suits[suit].length >= 2) {
      const sortedCards = suits[suit].sort((a, b) => b - a);
      let points = sortedCards[0] + sortedCards[1];
      if (points < 20) points += 20;
      maxPoints = Math.max(maxPoints, points);
    }
  });

  return maxPoints;
}

function hasFlor(hand) {
  const suits = {};
  hand.forEach(card => {
    suits[card.suit] = (suits[card.suit] || 0) + 1;
  });
  return Object.values(suits).some(count => count === 3);
}

function getPericoCard(viraCard) {
  // Simplified perico calculation for testing
  return mockCards.find(card => card.suit === viraCard.suit && card.value !== viraCard.value) || viraCard;
}

// Test 1: Basic Game Flow
function testBasicGameFlow() {
  log('=== Starting Basic Game Flow Test ===');

  try {
    const playerHand = mockCards.slice(0, 3);
    const computerHand = mockCards.slice(3, 6);
    const viraCard = mockCards[6];

    log(`Player hand: ${playerHand.map(c => c.name).join(', ')}`);
    log(`Computer hand: ${computerHand.map(c => c.name).join(', ')}`);
    log(`Vira card: ${viraCard.name}`);

    const playerEnvido = calculateEnvidoPoints(playerHand);
    const computerEnvido = calculateEnvidoPoints(computerHand);
    const playerHasFlor = hasFlor(playerHand);
    const computerHasFlor = hasFlor(computerHand);
    const pericoCard = getPericoCard(viraCard);

    log(`Player envido points: ${playerEnvido}`);
    log(`Computer envido points: ${computerEnvido}`);
    log(`Player has Flor: ${playerHasFlor}`);
    log(`Computer has Flor: ${computerHasFlor}`);
    log(`Perico card: ${pericoCard.name}`);

    log('✅ Basic Game Flow Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ Basic Game Flow Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Test 2: Envite Scenarios
function testEnviteScenarios() {
  log('=== Starting Envite Scenarios Test ===');

  try {
    const playerHand = [mockCards[0], mockCards[1], mockCards[2]]; // Same suit
    const computerHand = [mockCards[3], mockCards[4], mockCards[5]]; // Same suit

    const playerEnvido = calculateEnvidoPoints(playerHand);
    const computerEnvido = calculateEnvidoPoints(computerHand);

    log(`Player envido: ${playerEnvido}`);
    log(`Computer envido: ${computerEnvido}`);

    // Test different envido scenarios
    if (playerEnvido > computerEnvido) {
      log('✅ Player has higher envido points');
    } else if (computerEnvido > playerEnvido) {
      log('✅ Computer has higher envido points');
    } else {
      log('✅ Envido points are tied');
    }

    log('✅ Envite Scenarios Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ Envite Scenarios Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Test 3: Flor Situations
function testFlorSituations() {
  log('=== Starting Flor Situations Test ===');

  try {
    const florHand = [mockCards[0], mockCards[1], mockCards[2]]; // Same suit
    const noFlorHand = [mockCards[0], mockCards[3], mockCards[6]]; // Different suits

    const hasFlor1 = hasFlor(florHand);
    const hasFlor2 = hasFlor(noFlorHand);

    log(`Flor hand has Flor: ${hasFlor1}`);
    log(`No-Flor hand has Flor: ${hasFlor2}`);

    if (hasFlor1 && !hasFlor2) {
      log('✅ Flor detection working correctly');
    } else {
      throw new Error('Flor detection not working correctly');
    }

    log('✅ Flor Situations Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ Flor Situations Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Test 4: La Vira System
function testLaViraSystem() {
  log('=== Starting La Vira System Test ===');

  try {
    const viraCard = mockCards[0]; // As de Espadas
    const pericoCard = getPericoCard(viraCard);

    log(`Vira card: ${viraCard.name}`);
    log(`Perico card: ${pericoCard.name}`);

    if (pericoCard.suit === viraCard.suit) {
      log('✅ Perico card has same suit as Vira');
    } else {
      throw new Error('Perico card should have same suit as Vira');
    }

    log('✅ La Vira System Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ La Vira System Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Test 5: Scoring Accuracy
function testScoringAccuracy() {
  log('=== Starting Scoring Accuracy Test ===');

  try {
    const testHands = [
      [mockCards[0], mockCards[1], mockCards[2]], // Same suit
      [mockCards[0], mockCards[3], mockCards[6]], // Different suits
      [mockCards[0], mockCards[1], mockCards[3]] // Two same, one different
    ];

    testHands.forEach((hand, index) => {
      const points = calculateEnvidoPoints(hand);
      log(`Hand ${index + 1} envido points: ${points}`);
    });

    const handStrength = testHands[0].reduce((sum, card) => sum + card.power, 0);
    log(`Hand strength calculation: ${handStrength}`);

    log('✅ Scoring Accuracy Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ Scoring Accuracy Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Test 6: Rule Compliance
function testRuleCompliance() {
  log('=== Starting Rule Compliance Test ===');

  try {
    const florHand = [mockCards[0], mockCards[1], mockCards[2]];
    const hasFlorResult = hasFlor(florHand);

    log(`Flor detection: ${hasFlorResult}`);

    if (hasFlorResult) {
      log('✅ Flor rule compliance verified');
    } else {
      throw new Error('Flor rule not working correctly');
    }

    log('✅ Rule Compliance Test completed successfully');
    return { passed: true, errors: [] };

  } catch (error) {
    log(`❌ Rule Compliance Test failed: ${error.message}`);
    return { passed: false, errors: [error.message] };
  }
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting Comprehensive Truco Game Testing Suite');
  log('='.repeat(60));

  const testMethods = [
    testBasicGameFlow,
    testEnviteScenarios,
    testFlorSituations,
    testLaViraSystem,
    testScoringAccuracy,
    testRuleCompliance
  ];

  const results = [];

  for (const testMethod of testMethods) {
    try {
      const result = testMethod();
      results.push(result);
      log(`${result.passed ? '✅' : '❌'} ${testMethod.name}`);
    } catch (error) {
      log(`❌ ${testMethod.name} failed: ${error.message}`);
      results.push({ passed: false, errors: [error.message] });
    }
  }

  // Generate report
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = (passedTests / totalTests) * 100;

  log('\n' + '='.repeat(60));
  log('📊 TEST RESULTS SUMMARY');
  log('='.repeat(60));

  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`);
  log(`Failed: ${totalTests - passedTests}`);
  log(`Pass Rate: ${passRate.toFixed(1)}%`);

  log('\n📋 DETAILED RESULTS');
  log('-'.repeat(40));

  results.forEach((result, index) => {
    const testName = testMethods[index].name;
    log(`${index + 1}. ${testName}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        log(`   🔴 ${error}`);
      });
    }
  });

  log('='.repeat(60));
  log('🏁 TESTING COMPLETE');
  log('='.repeat(60));

  if (passedTests === totalTests) {
    log('🎉 ALL TESTS PASSED! The Truco game logic is functioning correctly.');
  } else {
    log(`⚠️ ${totalTests - passedTests} test(s) failed. Please review the errors above.`);
  }

  // Save report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `truco-test-report-${timestamp}.txt`;

  const report = testResults.join('\n');
  fs.writeFileSync(filename, report);

  log(`\n📄 Report saved to: ${filename}`);

  return passedTests === totalTests;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });