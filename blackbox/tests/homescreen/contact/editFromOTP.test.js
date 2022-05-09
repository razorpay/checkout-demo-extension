const createContactTest = require('../../../create/one-click-checkout/contact');

/**
 * enter random contact; proceed to next screen;
 * edit contact from OTP screen and proceed to payment
 * */
createContactTest({
  amount: 200 * 100,
  editFromOTP: true,
  skip: true,
});
