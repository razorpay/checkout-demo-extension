const createContactTest = require('../../../create/one-click-checkout/contact');

/**
 * when contact prefill options are sent
 * for logged out users
 */
createContactTest({
  amount: 200 * 100,
  prefillContact: true,
});
