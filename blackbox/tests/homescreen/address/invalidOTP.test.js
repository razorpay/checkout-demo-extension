const {
  createAddressTest,
} = require('../../../create/one-click-checkout/address');

// Test case: Checking for Entering Invalid OTP.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: true,
  serviceable: true,
  inValidOTP: true,
});
