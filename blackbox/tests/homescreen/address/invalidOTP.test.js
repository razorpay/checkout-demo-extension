const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

// Test case: Checking for Entering Invalid OTP.
createAddressTest(
  {
    amount: 200 * 100,
    serviceable: true,
    inValidOTP: true,
    addresses,
  },
  ['card']
);
