const createCardlessEMITest = require('../../../../create/cardless-emi');

createCardlessEMITest();
const testRunner = require('../../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([
    'callbackUrl',
    'optionalContact',
    'feeBearer',
    'partialPayment',
  ])
  .setExemptedTestCombinations([['callbackUrl', 'optionalContact']])
  .runOn(createCardlessEMITest);
