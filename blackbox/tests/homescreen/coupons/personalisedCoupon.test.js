const {
  createCouponsTest,
} = require('../../../create/one-click-checkout/coupons');

// test case: Personalised Coupon flow
createCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  couponCode: 'PERSON50',
  serviceable: true,
  isPersonalisedCoupon: true,
});
