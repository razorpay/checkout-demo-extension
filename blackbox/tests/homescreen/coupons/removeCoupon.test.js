const createCouponsTest = require('../../../create/one-click-checkout/coupons');

// test case: Valid coupon entered, no available coupons, coupon removed
createCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  removeCoupon: true,
  serviceable: true,
  saveAddress: false,
  couponCode: 'WELCOME10',
});
