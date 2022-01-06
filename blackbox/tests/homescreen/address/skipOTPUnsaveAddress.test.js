const {
  createAddressTest,
} = require('../../../create/one-click-checkout/address');

// Test case: Skip all the OTP's and checking as guest user.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: false,
  serviceable: true,
  skipOTP: true,
});
