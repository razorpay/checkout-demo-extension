const createAddressTest = require('../../../create/one-click-checkout/address');

// Test case: l0 => Add Address => Continue CTA (empty address form)
// Checks if user is shown error messages on invalid address form
createAddressTest({
  amount: 200 * 100,
  invalidAddress: true,
});
