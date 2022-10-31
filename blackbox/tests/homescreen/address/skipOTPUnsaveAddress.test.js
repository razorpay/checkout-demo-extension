const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Skip all the OTP's and checking as guest user.
createAddressTest({
  amount: 200 * 100,
  skipAccessOTP: true,
  skipSaveOTP: true,
  addresses,
  serviceable: true,
  saveAddress: true,
  isCODEligible: true,
});
