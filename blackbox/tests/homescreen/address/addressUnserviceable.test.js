const createAddressTest = require('../../../create/one-click-checkout/address');

// Test case: Checking the Unserviceable Address.
createAddressTest(
  {
    amount: 200 * 100,
    saveAddress: false,
    serviceable: false,
    isCODEligible: false,
  },
  ['card']
);
