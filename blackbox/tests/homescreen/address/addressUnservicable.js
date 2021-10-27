const createAddressTest = require('../../../create/address');

// Test case: Save address for anonymous user.
createAddressTest({
  show_address: true,
  is_address_servicable: false,
});
