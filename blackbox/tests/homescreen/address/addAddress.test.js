const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// Test case: Add the new Address.
createAddressTest({
  amount: 200 * 100,
  shippingFee: 50 * 100,
  loggedIn: true,
  anon: false,
  saveAddress: true,
  addShippingAddress: true,
  serviceable: true,
  isCODEligible: true,
  addLandmark: true,
  addresses,
});

// added address has single shipping option
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  saveAddress: true,
  addShippingAddress: true,
  serviceable: true,
  isCODEligible: true,
  addLandmark: true,
  addresses,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// added address has single shipping option
createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  saveAddress: true,
  addShippingAddress: true,
  serviceable: true,
  isCODEligible: true,
  addLandmark: true,
  addresses,
  shippingOptions,
  multipleShipping: true,
});
