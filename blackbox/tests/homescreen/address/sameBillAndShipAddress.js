const {
  createAddressTest,
} = require('../../../create/one-click-checkout/address');

// Test case: uncheck the Billing address same as shipping address on Shipping Address screen and again checking
// the Billing address same as shipping address on Billing Address screen.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: false,
  serviceable: true,
  sameBillShipAddr: true,
});
