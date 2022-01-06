const createCouponsTest = require('../../../create/one-click-checkout/coupons');

// test case: Invalid coupon entered, no available coupons
createCouponsTest({
  amount: 200 * 100,
  couponValid: false,
  discountAmount: 100 * 100,
  serviceable: true,
  isSaveAddress: false,
});
