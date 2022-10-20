const createCouponsTest = require('../../../create/one-click-checkout/coupons');

// test case: Personalised Coupon flow
createCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  couponCode: 'PERSON50',
  serviceable: true,
  personalised: true,
});

createCouponsTest({
  amount: 200 * 100,
  couponValid: true,
  discountAmount: 100 * 100,
  couponCode: 'PERSON50',
  showCoupons: true,
  availableCoupons: [
    {
      code: 'PERSON50',
      summary: 'Apply code PERSON50',
      tnc: [
        'Get up to Rs.500 off on your first purchase of a minimum cart value of Rs. 500',
        'Offer applicable on both COD & pre-paid orders!',
      ],
    },
  ],
  serviceable: true,
  personalised: true,
});
