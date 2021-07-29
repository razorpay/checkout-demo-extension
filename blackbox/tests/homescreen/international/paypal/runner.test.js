const createInternationalPayPalTest = require('../../../../create/international/paypal');
const testRunner = require('../../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([
    'callbackUrl',
    'feeBearer',
    'optionalContact',
    // 'optionalEmail', // Need to add an optional email merchant on func env for this to work
  ])
  .setExemptedTestCombinations([
    ['offers', 'feeBearer'],
    ['feeBearer', 'optionalContact'], // Need to be able to intercept requests in popup for this to work
  ])
  .runOn(createInternationalPayPalTest);
