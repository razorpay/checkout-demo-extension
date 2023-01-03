const createCouponsTest = require('../../../create/one-click-checkout/coupons');
const shippingOptions = require('../../../data/one-click-checkout/multiple_shipping_options.json');

// test case: Selects a coupon from available coupons
createCouponsTest({
  amount: 200 * 100,
  discountAmount: 100 * 100,
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
  couponValid: true,
  couponCode: 'WELCOME10',
  showCoupons: true,
  serviceable: true,
  saveAddress: false,
});

// selects a coupon from available coupons + used addres has single shipping option
createCouponsTest({
  amount: 200 * 100,
  discountAmount: 100 * 100,
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
  couponValid: true,
  couponCode: 'WELCOME10',
  showCoupons: true,
  serviceable: true,
  saveAddress: false,
  shippingOptions: {
    560001: [shippingOptions['560001'][0]],
    560002: [shippingOptions['560002'][0]],
  },
});

// selects a coupon from available coupons + used address has multiple shipping options
createCouponsTest({
  amount: 200 * 100,
  discountAmount: 100 * 100,
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
  couponValid: true,
  couponCode: 'WELCOME10',
  showCoupons: true,
  serviceable: true,
  saveAddress: false,
  shippingOptions,
  multipleShipping: true,
});
