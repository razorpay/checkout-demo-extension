const createAddressTest = require('../../../create/address');

// Test case: Skip address save for anonymous user.
createAddressTest({
  show_address: true,
  is_address_servicable: true,
  should_save_address: false,
});
