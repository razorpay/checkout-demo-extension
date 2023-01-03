const createAddressTest = require('../../../create/one-click-checkout/address');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// New user saves an address
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
});

// New user saves an address with single shipping option
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// New user saves an address with multiple shipping options
createAddressTest({
  amount: 200 * 100,
  saveAddress: true,
  serviceable: true,
  shippingOptions,
  multipleShipping: true,
});
