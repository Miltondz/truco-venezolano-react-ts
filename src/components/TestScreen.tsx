import React, { useState } from 'react';
import { TestRunner } from './TestRunner';
import { TestResult } from '../utils/testFramework';

// Make this a proper module
export {};

interface TestScreenProps {
  onNavigate: (screen: string) => void;
}

export const TestScreen: React.FC<TestScreenProps> = ({ onNavigate }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showReport, setShowReport] = useState(false);

  const handleTestComplete = (results: TestResult[]) => {
    setTestResults(results);
    setShowReport(true);
  };

  const generateReport = () => {
    if (testResults.length === 0) return '';

    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const passRate = (passedTests / totalTests) * 100;

    let report = `# Truco Game Comprehensive Test Report

## Overview
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${totalTests - passedTests}
- **Pass Rate**: ${passRate.toFixed(1)}%

## Test Results

`;

    testResults.forEach((result, index) => {
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
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'truco-test-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="test-screen active">
      <div className="test-container">
        <div className="test-header">
          <h1 className="test-title">
            Truco Game Testing Suite
          </h1>
          <p className="test-subtitle">
            Comprehensive testing of game logic, AI personalities, and rule compliance
          </p>
        </div>

        <div className="test-navigation">
          <button
            className="test-nav-button"
            onClick={() => onNavigate('main')}
          >
            ← Back to Main Menu
          </button>

          {testResults.length > 0 && (
            <button
              className="test-nav-button primary"
              onClick={downloadReport}
            >
              Download Report
            </button>
          )}
        </div>

        <TestRunner onComplete={handleTestComplete} />

        {showReport && testResults.length > 0 && (
          <div className="test-results">
            <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>Test Summary</h2>

            {(() => {
              const passedTests = testResults.filter(r => r.passed).length;
              const totalTests = testResults.length;
              const passRate = (passedTests / totalTests) * 100;

              return (
                <div className={`test-summary ${passRate === 100 ? '' : 'failed'}`}>
                  <div className="test-summary-header">
                    <span className="test-summary-title">
                      Overall Result: {passRate === 100 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
                    </span>
                    <span className={`test-summary-score ${passRate === 100 ? '' : 'failed'}`}>
                      {passRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="test-summary-subtitle">
                    {passedTests} of {totalTests} tests passed
                  </div>
                </div>
              );
            })()}

            <div className="test-results-grid">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`test-result-item ${result.passed ? '' : 'failed'}`}
                >
                  <div className="test-result-header">
                    <span className="test-result-icon">
                      {result.passed ? '✅' : '❌'}
                    </span>
                    <h3 className={`test-result-title ${result.passed ? '' : 'failed'}`}>
                      {result.scenario}
                    </h3>
                  </div>
                  <p className="test-result-details">
                    {result.details}
                  </p>
                  {result.errors.length > 0 && (
                    <div className="test-result-errors">
                      <div className="test-result-errors-title">Errors:</div>
                      <ul className="test-result-errors-list">
                        {result.errors.map((error, i) => (
                          <li key={i} className="test-result-errors-item">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};