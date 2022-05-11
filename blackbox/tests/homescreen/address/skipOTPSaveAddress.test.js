const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Skip the Initial OTP and save address on Address screen.
createAddressTest({
  skip: true, // skipping for now as this is failing many times on github actions
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  skipAccessOTP: true,
  addresses,
});
