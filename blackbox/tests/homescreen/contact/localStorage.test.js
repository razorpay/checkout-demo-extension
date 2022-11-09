const createContactTest = require('../../../create/one-click-checkout/contact');

/**
 * when contact details are prefilled
 * from localStorage on mobile devices
 */
createContactTest({
  amount: 200 * 100,
  emulate: 'Nexus 10', // android
  globalCustomer: true,
});
