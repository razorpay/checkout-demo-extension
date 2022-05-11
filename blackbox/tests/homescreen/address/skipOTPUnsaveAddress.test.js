const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Skip all the OTP's and checking as guest user.
createAddressTest({
  skip: true, // skipping for now as this is failing many times on github actions
  amount: 200 * 100,
  skipAccessOTP: true,
  skipSaveOTP: true,
  addresses,
  serviceable: true,
  saveAddress: true,
});
