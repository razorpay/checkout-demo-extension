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
  diffBillShipAddr = true;

testRunner(oneClickCheckoutTests, [
  { couponValid, serviceable, diffBillShipAddr, cod },
  { couponValid, serviceable, diffBillShipAddr, disableCOD },
  { availableCoupons, serviceable, diffBillShipAddr, cod },
  { availableCoupons, serviceable, diffBillShipAddr, disableCOD },
  { removeCoupon, serviceable, diffBillShipAddr, cod },
  { removeCoupon, serviceable, diffBillShipAddr, disableCOD },
]);
