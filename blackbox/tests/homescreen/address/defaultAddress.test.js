const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// Test case: Select the default address at L0 screen
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  isCODEligible: true,
  addresses,
});

// default address has single shipping option
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  isCODEligible: true,
  addresses,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// default address has multiple shipping options
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  serviceable: true,
  isCODEligible: true,
  addresses,
  shippingOptions,
  multipleShipping: true,
});
