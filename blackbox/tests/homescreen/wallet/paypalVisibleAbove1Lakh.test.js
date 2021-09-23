const createWalletTest = require('../../../create/wallet');

/**
 * Paypal Wallet visible for amount > 1L
 */

createWalletTest({
  paypalcc: true,
  amountAboveLimit: true, // > 1lakh
});
