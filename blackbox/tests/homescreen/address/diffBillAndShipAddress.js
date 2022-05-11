const createAddressTest = require('../../../create/one-click-checkout/address');

// Test case: uncheck the Billing address same as shipping address and entering new billing address.
createAddressTest({
  amount: 200 * 100,
  saveAddress: false,
  serviceable: true,
  addBillingAddress: true,
  isCODEligible: false,
});
