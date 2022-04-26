const createContactTest = require('../../../create/one-click-checkout/contact');

/**
 * enter random contact; proceed to next screen; come back to L0;
 * edit contact and proceed to payment
 * */
createContactTest({
  amount: 200 * 100,
  editFromHome: true,
});
