const createCouponsTest = require('../../../create/coupons');

// test case: Valid coupon entered, no available coupons, coupon removed
createCouponsTest({
  amount: 2000 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  removeCoupon: true,
});
