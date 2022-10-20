const createCouponsTest = require('../../../create/one-click-checkout/coupons');

createCouponsTest({
  amount: 200 * 100,
  availableCoupons: [
    {
      code: 'WELCOME10',
      summary:
        'Apply code WELCOME10 & get 10% off on your first Rowdy purchase',
      tnc: [
        'Get up to Rs.500 off on your first purchase of a minimum cart value of Rs. 500',
        'Offer applicable on both COD & pre-paid orders!',
      ],
    },
    {
      code: 'MYROWDYGANG',
      summary:
        'Use code MYROWDYGANG & get 15% off for your Rowdy gang purchase',
      tnc: [
        'Avail a maximum of Rs.1000 off on a minimum cart value of Rs. 4000.',
        'Offer applicable on both COD & pre-paid orders!',
      ],
    },
  ],
  showCoupons: false,
  serviceable: true,
  saveAddress: false,
  couponValid: true,
  couponCode: 'WELCOME10',
  discountAmount: 100 * 100,
});
