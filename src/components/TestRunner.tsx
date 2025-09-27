import React, { useState, useEffect } from 'react';
import { TestResult } from '../utils/testFramework';
import { testFramework } from '../utils/testFramework';

// Make this a proper module
export {};

interface TestRunnerProps {
  onComplete: (results: TestResult[]) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Mock console.log to capture test logs
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      setLogs(prev => [...prev, message]);
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults([]);

    try {
      // Run each test individually to track progress
      const testMethods = [
        { name: 'Basic Game Flow', method: () => testFramework.testBasicGameFlow() },
        { name: 'Envite Scenarios', method: () => testFramework.testEnviteScenarios() },
        { name: 'Truco Progression', method: () => testFramework.testTrucoProgression() },
        { name: 'Flor Situations', method: () => testFramework.testFlorSituations() },
        { name: 'Estar Cantando', method: () => testFramework.testEstarCantando() },
        { name: 'Endgame Scenarios', method: () => testFramework.testEndgameScenarios() },
        { name: 'La Vira System', method: () => testFramework.testLaViraSystem() },
        { name: 'AI Personality Testing', method: () => testFramework.testAIPersonalities() },
        { name: 'Scoring Accuracy', method: () => testFramework.testScoringAccuracy() },
        { name: 'Rule Compliance', method: () => testFramework.testRuleCompliance() }
      ];

      const testResults: TestResult[] = [];

      for (const test of testMethods) {
        setCurrentTest(test.name);
        try {
          const result = await test.method();
          testResults.push(result);
          setResults([...testResults]);
        } catch (error) {
          testResults.push({
            scenario: test.name,
            passed: false,
            details: 'Test execution failed',
            errors: [String(error)],
            logs: []
          });
          setResults([...testResults]);
        }
      }

      setCurrentTest('');
      setIsRunning(false);
      onComplete(testResults);

    } catch (error) {
      console.error('Test execution failed:', error);
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#4CAF50' }}>
        Truco Game Comprehensive Test Suite
      </h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: isRunning ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        {results.length > 0 && (
          <div style={{
            display: 'inline-block',
            marginLeft: '20px',
            padding: '10px 20px',
            backgroundColor: passRate === 100 ? '#4CAF50' : '#f44336',
            borderRadius: '5px',
            color: 'white'
          }}>
            Pass Rate: {passRate.toFixed(1)}% ({passedTests}/{totalTests})
          </div>
        )}
      </div>

      {isRunning && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#333',
          borderRadius: '5px'
        }}>
          <p>Running: <strong>{currentTest}</strong></p>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#555',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#4CAF50',
              width: '100%',
              animation: 'loading 1s ease-in-out infinite alternate'
            }} />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>

      {results.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Test Results Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  border: `2px solid ${result.passed ? '#4CAF50' : '#f44336'}`,
                  borderRadius: '8px',
                  backgroundColor: result.passed ? '#1a3a1a' : '#3a1a1a'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '20px',
                    marginRight: '10px'
                  }}>
                    {result.passed ? '✅' : '❌'}
                  </span>
                  <h3 style={{ margin: 0, color: result.passed ? '#4CAF50' : '#f44336' }}>
                    {result.scenario}
                  </h3>
                </div>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>
                  {result.details}
                </p>
                {result.errors.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: '#f44336' }}>Errors:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#ff9999' }}>
                      {result.errors.map((error, i) => (
                        <li key={i} style={{ fontSize: '12px' }}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Test Logs</h2>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '15px',
            borderRadius: '5px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '2px', color: '#ccc' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={() => {
              const report = testFramework.generateReport(results);
              const blob = new Blob([report], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'truco-test-report.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Download Full Report
          </button>
        </div>
      )}
    </div>
  );
};