const createAddressTest = require('../../../create/one-click-checkout/address');

// New user saves an address
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
});
