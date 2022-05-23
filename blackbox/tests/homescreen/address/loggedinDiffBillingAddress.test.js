const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Unchecking billing address checkbox at L0 and adding billing addr
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  isCODEligible: false,
  addBillingAddress: true,
  saveAddress: true,
  addresses,
  skip: true,
});
