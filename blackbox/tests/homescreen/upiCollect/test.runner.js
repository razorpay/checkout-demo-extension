const createUPICollectTest = require('../../../create/upi-collect');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(testRunner.globalFeatureList)
  .setTargetFeature('offers')
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['offers', 'downtimeHigh'],
    ['downtimeHigh', 'downtimeLow'],
  ])
  .runOn(createUPICollectTest);
