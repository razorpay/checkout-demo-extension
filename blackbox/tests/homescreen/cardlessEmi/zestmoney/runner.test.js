const createCardlessEMITest = require('../../../../create/cardless-emi');
const testRunner = require('../../../../create/checkout-test-runner');

testRunner
  .setTestFeatures(['callbackUrl', 'optionalContact', 'feeBearer'])
  .setExemptedTestCombinations([['callbackUrl', 'optionalContact']])
  .runOn(createCardlessEMITest);
