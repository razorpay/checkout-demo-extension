const create100PercentCouponsTest = require('../../../create/one-click-checkout/coupons');

create100PercentCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 200 * 100,
  couponCode: 'WELCOME10',
  serviceable: true,
  saveAddress: false,
});
