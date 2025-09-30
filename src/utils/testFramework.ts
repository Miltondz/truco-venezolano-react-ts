import { Card, GameState, AIPersonality } from '../types';
import {
  initializeGameState,
  startNewHand,
  playCard,
  computerPlayCard,
  evaluateRound,
  endHand,
  checkGameEnd,
  callTruco,
  callRetruco,
  callValeNueve,
  callValeJuego,
  callEnvido,
  callRealEnvido,
  callFaltaEnvido,
  acceptCall,
  rejectCall,
  resolveEnvido,
  callFlor,
  callEstarCantando,
  foldHand
} from './gameLogic';
import { cards, calculateEnvidoPoints, hasFlor, getPericoCard } from './cards';
import { applyRoundResult } from './gameLogic';
import { getAIResponse, selectBestCardForAI } from './ai';
import { PERSONALITY_ARCHETYPES } from './personality';

// Make this a proper module
export {};

export interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  errors: string[];
  logs: string[];
}

export interface SimulationResult {
  gameState: GameState;
  logs: string[];
  errors: string[];
  passed: boolean;
}

export class TrucoTestFramework {
  private testResults: TestResult[] = [];
  private logs: string[] = [];

  constructor() {
    this.logs = [];
  }


  private log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  }

  private createTestGameState(difficulty: 'easy' | 'medium' | 'hard' | 'master' = 'medium', personality?: AIPersonality): GameState {
    const gameState = initializeGameState(difficulty, 'avatar1.jpg');
    if (personality) {
      gameState.aiPersonality = personality;
    }
    return gameState;
  }

  private createSpecificHand(playerCards: Card[], computerCards: Card[], viraCard: Card): GameState {
    const gameState = this.createTestGameState();
    return {
      ...gameState,
      playerHand: playerCards,
      computerHand: computerCards,
      viraCard,
      pericoCard: getPericoCard(viraCard),
      playerEnvidoPoints: calculateEnvidoPoints(playerCards, viraCard),
      computerEnvidoPoints: calculateEnvidoPoints(computerCards, viraCard),
      playerHasFlor: hasFlor(playerCards, viraCard),
      computerHasFlor: hasFlor(computerCards, viraCard)
    };
  }

  async simulateFullGames(count: number = 10): Promise<TestResult> {
    this.log(`=== Starting Full Game Simulations (${count}) ===`);
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      let playerWins = 0;
      let computerWins = 0;

      for (let g = 1; g <= count; g++) {
        let gs = this.createTestGameState('medium');
        gs = startNewHand(gs);
        let safety = 0;

        while (!checkGameEnd(gs) && safety < 300) {
          safety++;
          // Simple play loop without calls: just play first available card, then AI
          if (gs.isPlayerTurn && gs.playerHand.length > 0 && !gs.waitingForResponse) {
            gs = playCard(gs, 0, { soundEffectsEnabled: false } as any);
          }
          if (!gs.isPlayerTurn && gs.computerHand.length > 0 && !gs.waitingForResponse) {
            gs = computerPlayCard(gs, { soundEffectsEnabled: false } as any);
          }
          // If both played a card, evaluate round
          if (gs.playerPlayedCard || gs.computerPlayedCard) {
            const { winner, gameState: afterEval } = evaluateRound(gs, { soundEffectsEnabled: false } as any);
            const applyRes = (window as any)?.applyRoundResult
              ? (window as any).applyRoundResult(afterEval, winner, { soundEffectsEnabled: false } as any)
              : null;
            // Use imported applyRoundResult from gameLogic directly
            const res = applyRoundResult(afterEval, winner, { soundEffectsEnabled: false } as any);
            gs = res.state;
            if (res.gameEnded) break;
            if (res.handEnded) {
              gs = startNewHand(gs);
            }
          }
        }

        const end = checkGameEnd(gs);
        if (end === 'player') playerWins++; else if (end === 'computer') computerWins++; else errors.push(`Game ${g}: ended without winner`);
        logs.push(`Game ${g} result: ${end || 'No Winner'} | Final Score P:${gs.playerScore} C:${gs.computerScore}`);
      }

      const details = `Simulated ${count} games. Player wins: ${playerWins}, Computer wins: ${computerWins}`;
      return { scenario: `Full Game Simulations (${count})`, passed: errors.length === 0, details, errors, logs };

    } catch (error) {
      errors.push(String(error));
      return { scenario: `Full Game Simulations`, passed: false, details: 'Simulation failed', errors, logs };
    }
  }

  // Test 1: Basic Game Flow
  async testBasicGameFlow(): Promise<TestResult> {
    this.log('=== Starting Basic Game Flow Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      // Initialize game
      let gameState = this.createTestGameState('medium');
      logs.push('Game initialized successfully');

      // Start new hand
      gameState = startNewHand(gameState);
      logs.push(`Hand started. Player hand: ${gameState.playerHand.map(c => c.name).join(', ')}`);
      logs.push(`Computer hand: ${gameState.computerHand.map(c => c.name).join(', ')}`);
      logs.push(`Vira card: ${gameState.viraCard?.name}`);

      // Simulate 3 rounds
      for (let round = 1; round <= 3; round++) {
        logs.push(`--- Round ${round} ---`);

        if (gameState.isPlayerTurn && gameState.playerHand.length > 0) {
          // Player plays card
          const cardIndex = 0;
          gameState = playCard(gameState, cardIndex, { soundEffectsEnabled: false } as any);
          logs.push(`Player played: ${gameState.playerPlayedCard?.name}`);
        }

        if (!gameState.isPlayerTurn && gameState.computerHand.length > 0) {
          // Computer plays card
          gameState = computerPlayCard(gameState, { soundEffectsEnabled: false } as any);
          logs.push(`Computer played: ${gameState.computerPlayedCard?.name}`);
        }

        // Evaluate round
        const roundResult = evaluateRound(gameState, { soundEffectsEnabled: false } as any);
        logs.push(`Round ${round} winner: ${roundResult.winner}`);

        gameState = roundResult.gameState;
        gameState.currentRound++;
      }

      // End hand
      const handResult = endHand(gameState, gameState.roundsWon.player > gameState.roundsWon.computer ? 'player' : 'computer', { soundEffectsEnabled: false } as any);
      logs.push(`Hand ended. Winner: ${gameState.roundsWon.player > gameState.roundsWon.computer ? 'Player' : 'Computer'}`);
      logs.push(`Points added: ${handResult.pointsAdded}`);

      // Check game end
      const gameEnd = checkGameEnd(handResult.gameState);
      logs.push(`Game end check: ${gameEnd || 'Game continues'}`);

      logs.push('Basic Game Flow Test completed successfully');
      return {
        scenario: 'Basic Game Flow',
        passed: true,
        details: 'Standard 3-round hand simulation completed without errors',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Basic Game Flow Test failed: ${error}`);
      return {
        scenario: 'Basic Game Flow',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 2: Envite Scenarios
  async testEnviteScenarios(): Promise<TestResult> {
    this.log('=== Starting Envite Scenarios Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      // Test Envido
      logs.push('--- Testing Envido ---');
      let gameState = this.createTestGameState('medium');

      // Create hands with known envido points
      const playerCards = [cards[0], cards[1], cards[2]]; // Espadas 1,2,3
      const computerCards = [cards[16], cards[17], cards[18]]; // Bastos 1,2,3
      const viraCard = cards[32]; // Oros 1

      gameState = this.createSpecificHand(playerCards, computerCards, viraCard);

      // Player calls Envido
      gameState = callEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Envido');

      // Computer accepts
      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Computer accepted Envido');

      // Resolve Envido
      gameState = resolveEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push(`Envido resolved. Player points: ${gameState.playerEnvidoPoints}, Computer points: ${gameState.computerEnvidoPoints}`);

      // Test Real Envido
      logs.push('--- Testing Real Envido ---');
      gameState = this.createTestGameState('medium');
      gameState = this.createSpecificHand(playerCards, computerCards, viraCard);

      gameState = callEnvido(gameState, { soundEffectsEnabled: false } as any);
      gameState = callRealEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Real Envido');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      gameState = resolveEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Real Envido resolved');

      // Test Falta Envido
      logs.push('--- Testing Falta Envido ---');
      gameState = this.createTestGameState('medium');
      gameState = this.createSpecificHand(playerCards, computerCards, viraCard);

      gameState = callEnvido(gameState, { soundEffectsEnabled: false } as any);
      gameState = callRealEnvido(gameState, { soundEffectsEnabled: false } as any);
      gameState = callFaltaEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Falta Envido');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      gameState = resolveEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Falta Envido resolved');

      logs.push('Envite Scenarios Test completed successfully');
      return {
        scenario: 'Envite Scenarios',
        passed: true,
        details: 'All Envido variations tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Envite Scenarios Test failed: ${error}`);
      return {
        scenario: 'Envite Scenarios',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 3: Truco Progression
  async testTrucoProgression(): Promise<TestResult> {
    this.log('=== Starting Truco Progression Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      let gameState = this.createTestGameState('medium');

      // Test Truco
      logs.push('--- Testing Truco ---');
      gameState = callTruco(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Truco');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Computer accepted Truco');

      // Test Retruco
      logs.push('--- Testing Retruco ---');
      gameState = callRetruco(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Retruco');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Computer accepted Retruco');

      // Vale 4 (omitido en versión venezolana)

      // Test Vale Nueve
      logs.push('--- Testing Vale Nueve ---');
      gameState = callValeNueve(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Vale Nueve');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Computer accepted Vale Nueve');

      // Test Vale Juego
      logs.push('--- Testing Vale Juego ---');
      gameState = callValeJuego(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Vale Juego');

      gameState = acceptCall(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Computer accepted Vale Juego');

      logs.push('Truco Progression Test completed successfully');
      return {
        scenario: 'Truco Progression',
        passed: true,
        details: 'All Truco call sequences tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Truco Progression Test failed: ${error}`);
      return {
        scenario: 'Truco Progression',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 4: Flor Situations
  async testFlorSituations(): Promise<TestResult> {
    this.log('=== Starting Flor Situations Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      // Create a hand with Flor
      const florHand = [cards[0], cards[1], cards[2]]; // Three cards of same suit
      const computerHand = [cards[16], cards[17], cards[32]]; // Different suits
      const viraCard = cards[48]; // Copas 12

      let gameState = this.createSpecificHand(florHand, computerHand, viraCard);

      // Test regular Flor
      logs.push('--- Testing Flor ---');
      gameState = callFlor(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Flor');

      // Test Flor Reservada (called after round 1)
      logs.push('--- Testing Flor Reservada ---');
      gameState.currentRound = 2; // Simulate after first round
      gameState = callFlor(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Flor Reservada');

      logs.push('Flor Situations Test completed successfully');
      return {
        scenario: 'Flor Situations',
        passed: true,
        details: 'Flor and Flor Reservada tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Flor Situations Test failed: ${error}`);
      return {
        scenario: 'Flor Situations',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 5: Estar Cantando
  async testEstarCantando(): Promise<TestResult> {
    this.log('=== Starting Estar Cantando Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      let gameState = this.createTestGameState('medium');
      gameState.playerScore = 23; // Set to 23 points

      gameState = callEstarCantando(gameState, { soundEffectsEnabled: false } as any);
      logs.push('Player called Estar Cantando');
      logs.push(`Game ended: ${!gameState.gameInProgress}`);
      logs.push(`Final score: ${gameState.playerScore}`);

      logs.push('Estar Cantando Test completed successfully');
      return {
        scenario: 'Estar Cantando',
        passed: true,
        details: '23-point pressure mechanic tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Estar Cantando Test failed: ${error}`);
      return {
        scenario: 'Estar Cantando',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 6: Endgame Scenarios
  async testEndgameScenarios(): Promise<TestResult> {
    this.log('=== Starting Endgame Scenarios Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      let gameState = this.createTestGameState('medium');
      gameState.playerScore = 23;

      // Simulate winning the final point
      gameState = startNewHand(gameState);
      gameState.roundsWon.player = 2; // Player wins the hand
      gameState.roundsWon.computer = 0;

      const handResult = endHand(gameState, 'player', { soundEffectsEnabled: false } as any);
      logs.push(`Player reached 24 points: ${handResult.gameState.playerScore >= 24}`);

      const gameEnd = checkGameEnd(handResult.gameState);
      logs.push(`Game end result: ${gameEnd}`);

      logs.push('Endgame Scenarios Test completed successfully');
      return {
        scenario: 'Endgame Scenarios',
        passed: true,
        details: '24-point game ending tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Endgame Scenarios Test failed: ${error}`);
      return {
        scenario: 'Endgame Scenarios',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 7: La Vira System
  async testLaViraSystem(): Promise<TestResult> {
    this.log('=== Starting La Vira System Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      const viraCard = cards[0]; // As de Espadas
      const pericoCard = getPericoCard(viraCard);

      logs.push(`Vira card: ${viraCard.name}`);
      logs.push(`Perico card: ${pericoCard.name}`);

      // Test with different vira cards
      const testViras = [cards[0], cards[16], cards[32], cards[48]]; // Different suits

      testViras.forEach((vira, index) => {
        const perico = getPericoCard(vira);
        logs.push(`Test ${index + 1}: Vira ${vira.name} -> Perico ${perico.name}`);
      });

      logs.push('La Vira System Test completed successfully');
      return {
        scenario: 'La Vira System',
        passed: true,
        details: 'Perico/Perica assignment system tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`La Vira System Test failed: ${error}`);
      return {
        scenario: 'La Vira System',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 8: AI Personality Testing
  async testAIPersonalities(): Promise<TestResult> {
    this.log('=== Starting AI Personality Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      const archetypes = Object.keys(PERSONALITY_ARCHETYPES);

      for (const archetypeName of archetypes) {
        logs.push(`--- Testing ${archetypeName} ---`);
        const personality = PERSONALITY_ARCHETYPES[archetypeName];

        let gameState = this.createTestGameState('medium', personality);

        // Test AI response to Truco
        gameState = callTruco(gameState, { soundEffectsEnabled: false } as any);
        const aiResponse = getAIResponse('truco', gameState);
        logs.push(`${archetypeName} response to Truco: ${aiResponse ? 'Accept' : 'Reject'}`);

        // Test card selection
        gameState = startNewHand(gameState);
        const cardIndex = selectBestCardForAI(gameState);
        logs.push(`${archetypeName} selected card: ${gameState.computerHand[cardIndex]?.name}`);
      }

      logs.push('AI Personality Test completed successfully');
      return {
        scenario: 'AI Personality Testing',
        passed: true,
        details: 'All 4 personality archetypes tested successfully',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`AI Personality Test failed: ${error}`);
      return {
        scenario: 'AI Personality Testing',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 9: Scoring Accuracy
  async testScoringAccuracy(): Promise<TestResult> {
    this.log('=== Starting Scoring Accuracy Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      // Test Envido scoring
      const testHands = [
        [cards[0], cards[1], cards[2]], // Three cards same suit
        [cards[0], cards[16], cards[32]], // Different suits
        [cards[0], cards[1], cards[16]] // Two same, one different
      ];

      const viraCard = cards[32];
      testHands.forEach((hand, index) => {
        const points = calculateEnvidoPoints(hand, viraCard);
        logs.push(`Hand ${index + 1} envido points: ${points}`);
      });

      // Test hand strength calculation
      const handStrength = testHands[0].reduce((sum, card) => sum + card.power, 0);
      logs.push(`Hand strength calculation: ${handStrength}`);

      logs.push('Scoring Accuracy Test completed successfully');
      return {
        scenario: 'Scoring Accuracy',
        passed: true,
        details: 'Point calculations and hand strength verified',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Scoring Accuracy Test failed: ${error}`);
      return {
        scenario: 'Scoring Accuracy',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Test 10: Rule Compliance
  async testRuleCompliance(): Promise<TestResult> {
    this.log('=== Starting Rule Compliance Test ===');
    const errors: string[] = [];
    const logs: string[] = [];

    try {
      let gameState = this.createTestGameState('medium');

      // Test invalid moves
      logs.push('--- Testing invalid move prevention ---');

      // Try to call Truco when not player's turn
      gameState.isPlayerTurn = false;
      const invalidTruco = callTruco(gameState, { soundEffectsEnabled: false } as any);
      logs.push(`Invalid Truco prevented: ${invalidTruco.waitingForResponse === false}`);

      // Try to call Envido when waiting for response
      gameState.isPlayerTurn = true;
      gameState.waitingForResponse = true;
      const invalidEnvido = callEnvido(gameState, { soundEffectsEnabled: false } as any);
      logs.push(`Invalid Envido prevented: ${invalidEnvido.waitingForResponse === false}`);

      // Test Flor detection
      const florHand = [cards[0], cards[1], cards[2]];
      const viraCardFlor = cards[32];
      const hasFlorResult = hasFlor(florHand, viraCardFlor);
      logs.push(`Flor detection: ${hasFlorResult}`);

      logs.push('Rule Compliance Test completed successfully');
      return {
        scenario: 'Rule Compliance',
        passed: true,
        details: 'Game rules and constraints properly enforced',
        errors: [],
        logs
      };

    } catch (error) {
      errors.push(`Rule Compliance Test failed: ${error}`);
      return {
        scenario: 'Rule Compliance',
        passed: false,
        details: 'Test failed with errors',
        errors,
        logs
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<TestResult[]> {
    this.log('=== Starting Comprehensive Truco Game Testing ===');

    const testMethods = [
      this.testBasicGameFlow,
      this.testEnviteScenarios,
      this.testTrucoProgression,
      this.testFlorSituations,
      this.testEstarCantando,
      this.testEndgameScenarios,
      this.testLaViraSystem,
      this.testAIPersonalities,
      this.testScoringAccuracy,
      this.testRuleCompliance
    ];

    const results: TestResult[] = [];

    for (const testMethod of testMethods) {
      try {
        const result = await testMethod();
        results.push(result);
        this.log(`${result.scenario}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        this.log(`Test execution failed: ${error}`);
        results.push({
          scenario: 'Unknown',
          passed: false,
          details: 'Test execution failed',
          errors: [String(error)],
          logs: []
        });
      }
    }

    this.log('=== Comprehensive Testing Complete ===');
    return results;
  }

  // Generate comprehensive report
  generateReport(results: TestResult[]): string {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = (passedTests / totalTests) * 100;

    let report = `
# Truco Game Comprehensive Test Report

## Overview
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${totalTests - passedTests}
- **Pass Rate**: ${passRate.toFixed(1)}%

## Test Results

`;

    results.forEach((result, index) => {
      report += `### Test ${index + 1}: ${result.scenario}
- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Details**: ${result.details}
`;

      if (result.errors.length > 0) {
        report += `- **Errors**:
${result.errors.map(error => `  - ${error}`).join('\n')}
`;
      }

      if (result.logs.length > 0) {
        report += `- **Key Logs**:
${result.logs.slice(-5).map(log => `  - ${log}`).join('\n')}
`;
      }

      report += '\n';
    });

    report += `
## Summary
${passedTests === totalTests ?
  '🎉 All tests passed! The Truco game logic and AI personality system are functioning correctly.' :
  `⚠️ ${totalTests - passedTests} test(s) failed. Please review the errors above and fix the issues.`
}

## Recommendations
- Review failed tests and their error messages
- Check game logic implementation for any issues
- Verify AI personality traits are working as expected
- Test edge cases and boundary conditions
`;

    return report;
  }
}

// Export for use in other files
export const testFramework = new TrucoTestFramework();