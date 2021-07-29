const createUPIOTMCollectTest = require('../../../create/upi-otm.js');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(testRunner.globalFeatureList)
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['offers', 'downtimeHigh'],
    ['downtimeHigh', 'downtimeLow'],
    ['offers', 'feeBearer'],
  ])
  .runOn(createUPIOTMCollectTest);
