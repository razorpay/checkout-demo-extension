const createUPIOtmTest = require('../../../create/upi-intent');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(testRunner.globalFeatureList)
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['offers', 'downtimeHigh'],
    ['downtimeHigh', 'downtimeLow'],
  ])
  .runOn(createUPIOtmTest);
