const {
  createAddressTest,
} = require('../../../create/one-click-checkout/address');

// Test case: Add the new Address.
createAddressTest({
  amount: 200 * 100,
  isSaveAddress: true,
  addAddress: true,
  serviceable: true,
  isCODEligible: false,
  showSavedAddress: true,
});
