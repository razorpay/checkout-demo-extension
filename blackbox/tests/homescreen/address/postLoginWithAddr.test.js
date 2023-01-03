const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// user has saved addresses but is logged out
createAddressTest({
  amount: 200 * 100,
  serviceable: true,
  addresses,
  isCODEligible: true,
});

// returning user's saved address has single shipping option
createAddressTest({
  amount: 200 * 100,
  serviceable: true,
  addresses,
  isCODEligible: true,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// returning user's saved address has multiple shipping options
createAddressTest({
  amount: 200 * 100,
  serviceable: true,
  addresses,
  isCODEligible: true,
  shippingOptions,
  multipleShipping: true,
});
