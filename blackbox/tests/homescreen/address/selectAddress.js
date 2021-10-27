const createAddressTest = require('../../../create/address');

// Test case: Select address from save addresses.
createAddressTest({
  show_address: true,
  is_address_servicable: true,
  address_saved: true,
});
