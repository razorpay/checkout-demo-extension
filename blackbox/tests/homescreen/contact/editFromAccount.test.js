const createContactTest = require('../../../create/one-click-checkout/contact');

/**
 * enter random contact; proceed to next screen; login and come back to L0;
 * open account tab; edit contact details and proceed to payment
 * */
createContactTest({
  amount: 200 * 100,
  editFromAccount: true,
});
