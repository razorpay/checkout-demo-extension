const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// Test case: Skip the Initial OTP and save address on Address screen.
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  skipAccessOTP: true,
  addresses,
  isCODEligible: true,
});

// Skip the Initial OTP and save address with single option.
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  isCODEligible: true,
  skipAccessOTP: true,
  addresses,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// Skip the Initial OTP and save address with multiple options.
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  isCODEligible: true,
  skipAccessOTP: true,
  addresses,
  shippingOptions,
  multipleShipping: true,
});
