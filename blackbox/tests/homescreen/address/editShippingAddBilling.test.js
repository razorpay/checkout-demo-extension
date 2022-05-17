const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Edit Shipping Address and add billing address
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  editShippingAddress: true,
  addBillingAddress: true,
  serviceable: true,
  isCODEligible: false,
  addresses,
  saveAddress: true,
});
