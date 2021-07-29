const createWebPaymentsTests = require('../../../create/upi-web-payments');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(testRunner.globalFeatureList)
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['downtimeHigh', 'downtimeLow'],
    ['offers', 'feeBearer'],
  ])
  .runOn(createWebPaymentsTests);
