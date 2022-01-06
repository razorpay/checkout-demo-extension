const oneClickCheckoutTests = require('../../../create/one-click-checkout/combination');
const {
  testRunner,
} = require('../../../create/one-click-checkout/1CC.test.runner');

const cod = true,
  disableCOD = true,
  unsaveAddress = true,
  removeCoupon = true,
  isPersonalisedCoupon = true;

testRunner(oneClickCheckoutTests, [
  { isPersonalisedCoupon, cod },
  { isPersonalisedCoupon, disableCOD },
  { removeCoupon, unsaveAddress, cod },
  { removeCoupon, unsaveAddress, disableCOD },
]);
