const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Add the new Address.
createAddressTest({
  amount: 200 * 100,
  shippingFee: 50 * 100,
  loggedIn: true,
  anon: false,
  saveAddress: true,
  addShippingAddress: true,
  serviceable: true,
  isCODEligible: true,
  addLandmark: true,
  addresses,
});
