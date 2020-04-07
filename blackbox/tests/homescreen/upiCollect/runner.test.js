const createUPICollectTest = require('../../../create/upi-collect');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(['downtimeHigh'])
  .setExemptedTestCombinations([
    ['offers', 'partialPayment'],
    ['offers', 'downtimeHigh'],
    ['downtimeHigh', 'downtimeLow'],
  ])
  .runOn(createUPICollectTest);
