const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const cod = true,
  disableCOD = true,
  inValidCoupon = true,
  serviceable = true,
  isSaveAddress = true,
  unsaveAddress = true;

testRunner(oneClickCheckoutTests, [
  { inValidCoupon, serviceable, isSaveAddress, cod },
  { inValidCoupon, serviceable, isSaveAddress, disableCOD },
  { inValidCoupon, unsaveAddress, cod },
  { inValidCoupon, unsaveAddress, disableCOD },
]);
