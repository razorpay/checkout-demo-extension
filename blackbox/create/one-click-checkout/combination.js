const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const { couponTestCases } = require('./coupons');
const { codTestCases } = require('./cod');
const { addressTestCases } = require('./address');

const COUPON_CODE = 'WELCOME10';
const AMOUNT = 2000;
const DISCOUNT_AMOUNT = 1000;
const AVAILABLE_COUPONS = [
  {
    code: 'WELCOME10',
    summary: 'Apply code WELCOME10 & get 10% off on your first Rowdy purchase',
    tnc: [
      'Get up to Rs.500 off on your first purchase of a minimum cart value of Rs. 500',
      'Offer applicable on both COD & pre-paid orders!',
    ],
  },
  {
    code: 'MYROWDYGANG',
    summary: 'Use code MYROWDYGANG & get 15% off for your Rowdy gang purchase',
    tnc: [
      'Avail a maximum of Rs.1000 off on a minimum cart value of Rs. 4000.',
      'Offer applicable on both COD & pre-paid orders!',
    ],
  },
];

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    { amount: AMOUNT, ...testFeatures }
  );

  const {
    couponValid,
    cod,
    disableCOD,
    availableCoupons,
    removeCoupon,
    isPersonalisedCoupon,
    prefillCoupon,
  } = testFeatures;
  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )(
    'One Click Checkout Combination test',
    ({ preferences, title, options }) => {
      test(title, async () => {
        if (cod || disableCOD) {
          preferences.methods.cod = true;
        }
        const context = await openCheckoutWithNewHomeScreen({
          page,
          options,
          preferences,
        });

        await couponTestCases(context, {
          couponValid,
          removeCoupon,
          amount: AMOUNT,
          discountAmount: DISCOUNT_AMOUNT,
          availableCoupons: availableCoupons && AVAILABLE_COUPONS,
          couponCode: COUPON_CODE,
          isPersonalisedCoupon,
          prefillCoupon,
        });
        await addressTestCases(context, testFeatures);
        await codTestCases(
          context,
          {
            amount: AMOUNT,
            discountAmount: DISCOUNT_AMOUNT,
            couponCode: COUPON_CODE,
            isCODEligible: cod,
            isSelectCOD: cod,
            isThirdWatchEligible: cod,
            ...testFeatures,
          },
          options
        );
      });
    }
  );
};
