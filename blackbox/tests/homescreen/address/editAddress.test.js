const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Edit the Address.
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  editShippingAddress: true,
  serviceable: true,
  isCODEligible: false,
  addresses,
  skip: true,
});
