const createWebPaymentsTests = require('../../../create/upi-web-payments');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([])
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['downtimeHigh', 'downtimeLow'],
  ])
  .runOn(createWebPaymentsTests);
