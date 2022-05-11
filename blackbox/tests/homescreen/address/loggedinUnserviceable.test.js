const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Block loggedin user if default address is unserviceable
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: false,
  addresses,
});
