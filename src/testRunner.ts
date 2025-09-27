import { testFramework } from './utils/testFramework';

// Make this a proper module
export {};

// Main test runner function
async function runTests() {
  console.log('🚀 Starting Comprehensive Truco Game Testing Suite');
  console.log('=' .repeat(60));

  try {
    const results = await testFramework.runAllTests();

    // Generate and display report
    const report = testFramework.generateReport(results);

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = (passedTests / totalTests) * 100;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);

    console.log('\n📋 DETAILED RESULTS');
    console.log('-'.repeat(40));

    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.scenario}: ${status}`);
      console.log(`   ${result.details}`);

      if (result.errors.length > 0) {
        console.log(`   🔴 Errors: ${result.errors.length}`);
        result.errors.forEach(error => {
          console.log(`      - ${error}`);
        });
      }

      if (result.logs.length > 0) {
        console.log(`   📝 Key logs:`);
        result.logs.slice(-3).forEach(log => {
          console.log(`      - ${log}`);
        });
      }

      console.log('');
    });

    console.log('='.repeat(60));
    console.log('🏁 TESTING COMPLETE');
    console.log('='.repeat(60));

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! The Truco game logic and AI personality system are functioning correctly.');
    } else {
      console.log(`⚠️ ${totalTests - passedTests} test(s) failed. Please review the errors above and fix the issues.`);
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('- Review failed tests and their error messages');
    console.log('- Check game logic implementation for any issues');
    console.log('- Verify AI personality traits are working as expected');
    console.log('- Test edge cases and boundary conditions');

    // Save detailed report to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `truco-test-report-${timestamp}.txt`;

    fs.writeFileSync(filename, report);
    console.log(`\n📄 Detailed report saved to: ${filename}`);

    return passedTests === totalTests;

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runTests };