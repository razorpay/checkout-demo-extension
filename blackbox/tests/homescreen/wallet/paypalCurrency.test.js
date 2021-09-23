const createWalletTest = require('../../../create/wallet');
const testRunner = require('blackbox/create/checkout-test-runner.js');

/**
 * Paypal Wallet Currency Conversion Flow Test
 */

testRunner
  .setTestFeatures(['callbackUrl'])
  .runOn(createWalletTest, { paypalcc: true });
