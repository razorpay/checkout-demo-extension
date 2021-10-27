const createAddressTest = require('../../../create/address');

// Test case: Save address for anonymous user.
createAddressTest({
  check_address: true,
  should_save_address: true,
  is_address_servicable: true,
  prefill: {
    name: 'Tester',
    zipcode: '560002',
    city: 'bengaluru',
    state: 'Karantaka',
    line1: '#1, Some house number',
    line2: 'Old town road',
    landmark: 'Near chianti',
    tag: 'Home',
  },
});
