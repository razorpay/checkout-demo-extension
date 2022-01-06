const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const couponValid = true,
  cod = true,
  disableCOD = true,
  availableCoupons = true,
  removeCoupon = true,
  serviceable = true,
  sameBillShipAddr = true;

testRunner(oneClickCheckoutTests, [
  { couponValid, serviceable, sameBillShipAddr, cod },
  { couponValid, serviceable, sameBillShipAddr, disableCOD },
  { availableCoupons, serviceable, sameBillShipAddr, cod },
  { availableCoupons, serviceable, sameBillShipAddr, disableCOD },
  { removeCoupon, serviceable, sameBillShipAddr, cod },
  { removeCoupon, serviceable, sameBillShipAddr, disableCOD },
]);
