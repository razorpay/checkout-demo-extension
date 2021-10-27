const createCouponsTest = require('../../../create/coupons');

// test case: Valid coupon entered, no available coupons
createCouponsTest({
  amount: 2000 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
});
