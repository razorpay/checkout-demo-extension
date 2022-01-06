const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const couponValid = true,
  cod = true,
  disableCOD = true,
  availableCoupons = true,
  serviceable = true,
  isSaveAddress = true;

testRunner(oneClickCheckoutTests, [
  { couponValid, serviceable, isSaveAddress, cod },
  { couponValid, serviceable, isSaveAddress, disableCOD },
  { availableCoupons, serviceable, isSaveAddress, cod },
  { availableCoupons, serviceable, isSaveAddress, disableCOD },
]);
