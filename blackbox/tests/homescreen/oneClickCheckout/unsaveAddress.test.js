const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const couponValid = true,
  unsaveAddress = true,
  cod = true,
  disableCOD = true,
  availableCoupons = true,
  prefillCoupon = true;

testRunner(oneClickCheckoutTests, [
  { couponValid, unsaveAddress, cod },
  { couponValid, unsaveAddress, disableCOD },
  { availableCoupons, unsaveAddress, cod },
  { availableCoupons, unsaveAddress, disableCOD },
]);
