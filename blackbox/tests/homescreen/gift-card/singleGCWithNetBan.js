const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Apply Single Gift card with Net banking.
createAddressTest({
  amount: 200 * 100,
  shippingFee: 50 * 100,
  loggedIn: true,
  anon: false,
  saveAddress: true,
  addShippingAddress: true,
  serviceable: true,
  isCODEligible: false,
  addLandmark: true,
  addresses,
  singleGC: true,
});
