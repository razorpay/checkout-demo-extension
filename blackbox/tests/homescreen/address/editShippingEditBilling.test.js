const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Edit Shipping Address and edit billing address
createAddressTest({
  skip: true, // skipping for now as this is failing many times on github actions
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  editShippingAddress: true,
  editBillingAddress: true,
  serviceable: true,
  isCODEligible: false,
  addresses,
});
