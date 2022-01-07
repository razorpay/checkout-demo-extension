const createAddressTest = require('../../../create/one-click-checkout/address');

// Test case: Select address from save addresses.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: true,
  serviceable: true,
});
