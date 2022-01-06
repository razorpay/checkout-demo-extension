const {
  createAddressTest,
} = require('../../../create/one-click-checkout/address');

// Test case: Skip the Initial OTP and save address on Address screen.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: true,
  serviceable: true,
  skipOTP: true,
});
