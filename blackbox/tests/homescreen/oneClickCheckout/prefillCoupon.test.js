const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const prefillCoupon = true,
  couponValid = true,
  cod = true,
  disableCOD = true,
  serviceable = true,
  skipOTP = true,
  isSaveAddress = true;

testRunner(oneClickCheckoutTests, [
  { prefillCoupon, couponValid, serviceable, isSaveAddress, cod },
  { prefillCoupon, couponValid, serviceable, isSaveAddress, disableCOD },
  { prefillCoupon, couponValid, serviceable, isSaveAddress, skipOTP, cod },
  {
    prefillCoupon,
    couponValid,
    serviceable,
    isSaveAddress,
    skipOTP,
    disableCOD,
  },
]);
