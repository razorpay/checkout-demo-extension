const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const couponValid = true,
  cod = true,
  disableCOD = true,
  availableCoupons = true,
  serviceable = true,
  isSaveAddress = true,
  skipOTP = true;

testRunner(oneClickCheckoutTests, [
  { couponValid, serviceable, isSaveAddress, skipOTP, cod },
  { couponValid, serviceable, isSaveAddress, skipOTP, disableCOD },
  { availableCoupons, serviceable, isSaveAddress, skipOTP, cod },
  { availableCoupons, serviceable, isSaveAddress, skipOTP, disableCOD },
]);
