const createAddressTest = require('../../../create/one-click-checkout/address');

// Test case: Skip address save for anonymous user.
createAddressTest({
  amount: 200 * 100,
  saveAddress: false,
  serviceable: true,
  isCODEligible: true,
});
