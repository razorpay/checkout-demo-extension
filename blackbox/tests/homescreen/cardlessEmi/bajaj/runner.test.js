const createCardlessEMITest = require('../../../../create/cardless-emi');
const testRunner = require('../../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([
    'callbackUrl',
    'optionalContact',
    'feeBearer',
    'partialPayment',
  ])
  .setExemptedTestCombinations([
    ['callbackUrl', 'optionalContact'],
    ['offers', 'feeBearer'],
  ])
  .runOn(createCardlessEMITest, { provider: 'bajaj' });
