const createAddressTest = require('../../../create/one-click-checkout/address');

createAddressTest({
  amount: 200 * 100,
  serviceable: true,
  internationalShippingEnabled: true,
});