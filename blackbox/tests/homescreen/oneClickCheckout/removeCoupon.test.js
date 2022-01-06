const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const cod = true,
  disableCOD = true,
  removeCoupon = true,
  serviceable = true,
  skipOTP = true,
  isSaveAddress = true;

testRunner(oneClickCheckoutTests, [
  { removeCoupon, serviceable, isSaveAddress, cod },
  { removeCoupon, serviceable, isSaveAddress, disableCOD },
  { removeCoupon, serviceable, isSaveAddress, skipOTP, cod },
  { removeCoupon, serviceable, isSaveAddress, skipOTP, disableCOD },
]);
