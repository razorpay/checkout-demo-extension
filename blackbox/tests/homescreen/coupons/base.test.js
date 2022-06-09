const createCouponsTest = require('../../../create/one-click-checkout/coupons');

// test case: Valid coupon entered, no available coupons
createCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  couponCode: 'WELCOME10',
  serviceable: true,
  saveAddress: false,
  skip: true,
});
