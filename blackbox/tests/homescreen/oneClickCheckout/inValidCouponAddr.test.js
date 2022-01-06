const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const couponValid = true,
  unsaveAddress = true,
  cod = true,
  disableCOD = true,
  inValidCoupon = true,
  serviceable = true,
  isSaveAddress = true,
  sameBillShipAddr = true,
  skipOTP = true,
  prefillCoupon = true,
  diffBillShipAddr = true;

testRunner(oneClickCheckoutTests, [
  /*
  { inValidCoupon, serviceable, diffBillShipAddr, cod },
  { inValidCoupon, serviceable, diffBillShipAddr, disableCOD },
  { inValidCoupon, serviceable, sameBillShipAddr, cod },
  { inValidCoupon, serviceable, sameBillShipAddr, disableCOD },
  */
  { prefillCoupon, couponValid, unsaveAddress, cod },
  { prefillCoupon, couponValid, unsaveAddress, disableCOD },
  { inValidCoupon, serviceable, isSaveAddress, skipOTP, cod },
  { inValidCoupon, serviceable, isSaveAddress, skipOTP, disableCOD },
]);
