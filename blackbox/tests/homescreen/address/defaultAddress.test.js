const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Select the default address at L0 screen
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  isCODEligible: false,
  addresses,
});
