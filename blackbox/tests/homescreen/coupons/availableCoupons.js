const createCouponsTest = require('../../../create/coupons');

// test case: Selects a coupon from available coupons
createCouponsTest({
  amount: 2000 * 100,
  availableCoupons: [
    {
      code: 'LUCKY',
      summary: 'Get 50% OFF',
      description:
        '50% off on a minimum purchase of ₹600. Maximum discount  ₹100',
      tnc: ['dagdasga', 'sahhqw'],
    },
    {
      code: 'RAIN10',
      summary: 'Get 10% OFF',
      description:
        '50% off on a minimum purchase of ₹600. Maximum discount  ₹100',
      tnc: ['dagdasga', 'sahhqw'],
    },
    {
      code: 'STEALDEAL',
      summary: 'Get 50% OFF',
      description:
        '50% off on a minimum purchase of ₹600. Maximum discount  ₹100',
      tnc: ['dagdasga', 'sahhqw'],
    },
  ],
});
