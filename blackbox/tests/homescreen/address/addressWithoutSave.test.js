const createAddressTest = require('../../../create/one-click-checkout/address');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// Test case: Skip address save for anonymous user.
createAddressTest({
  amount: 200 * 100,
  saveAddress: false,
  serviceable: true,
  isCODEligible: true,
});

// new address zipcode has single shipping option
createAddressTest({
  amount: 200 * 100,
  saveAddress: false,
  serviceable: true,
  isCODEligible: true,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// new address zipcode has single shipping option
createAddressTest({
  amount: 200 * 100,
  saveAddress: false,
  serviceable: true,
  isCODEligible: true,
  shippingOptions,
  multipleShipping: true,
});
