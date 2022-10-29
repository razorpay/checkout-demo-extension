const createAddressTest = require('../../../create/one-click-checkout/address');

createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  saveAddress: true,
  isCODEligible: false,
  addLandmark: true,
});
