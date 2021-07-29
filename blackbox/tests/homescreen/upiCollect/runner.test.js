const createUPICollectTest = require('../../../create/upi-collect');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(testRunner.globalFeatureList)
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['offers', 'downtimeHigh'],
    ['downtimeHigh', 'downtimeLow'],
    ['offers', 'feeBearer'],
  ])
  .runOn(createUPICollectTest);
