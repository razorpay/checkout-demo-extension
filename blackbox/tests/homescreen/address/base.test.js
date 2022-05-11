const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Select address from save addresses.
createAddressTest({
  amount: 200 * 100,
  serviceable: true,
  addresses,
});
