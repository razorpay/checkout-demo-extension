const createCouponsTest = require('../../../create/coupons');

// test case: Invalid coupon entered, no available coupons
createCouponsTest({
  amount: 2000 * 100,
  couponValid: false,
  discountAmount: 100 * 100,
});
