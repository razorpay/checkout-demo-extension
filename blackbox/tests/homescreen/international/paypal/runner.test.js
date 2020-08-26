const createInternationalPayPalTest = require('../../../../create/international/paypal');
const testRunner = require('../../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([
    'callbackUrl',
    'feeBearer',
    // 'optionalContact', // Creates payments on actual API, enable when language_code is supported in prod.
    // 'optionalEmail', // Need to add an optional email merchant on func env for this to work
  ])
  .setExemptedTestCombinations([
    ['feeBearer', 'optionalContact'], // Need to be able to intercept requests in popup for this to work
  ])
  .runOn(createInternationalPayPalTest);
