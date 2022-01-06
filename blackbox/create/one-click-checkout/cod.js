const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
} = require('../../actions/one-click-checkout/common');
const { selectPaymentMethod } = require('../../tests/homescreen/actions');
const { fillUserAddress } = require('../../actions/one-click-checkout/address');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { proceed } = require('../../tests/homescreen/sharedActions');
const { delay } = require('../../util');
const { submit } = require('../../actions/common');
const {
  handleCODPayment,
  checkDisabledCOD,
} = require('../../actions/one-click-checkout/cod');

async function codTestCases(context, features, options) {
  const {
    isCODEligible,
    isThirdWatchEligible,
    couponValid,
    removeCoupon,
    inValidCoupon,
    availableCoupons,
    isPersonalisedCoupon,
  } = features;

  await handleThirdWatchReq(context, isThirdWatchEligible);
  await handleUpdateOrderReq(context, options.order_id);
  await delay(200);
  if (couponValid || availableCoupons || isPersonalisedCoupon) {
    await handleFeeSummary(context, {
      amount: 2000,
      discountAmount: 1000,
      couponValid: true,
      couponCode: 'WELCOME10',
    });
  } else if (removeCoupon || inValidCoupon) {
    await handleFeeSummary(context, { amount: 2000 });
  } else {
    await handleFeeSummary(context, features);
  }
  if (isCODEligible) {
    features.isSelectCOD = true;
    features.couponValid =
      couponValid || availableCoupons || isPersonalisedCoupon;
    await delay(200);
    await selectPaymentMethod(context, 'cod');
    await submit(context, false);
    await handleFeeSummary(context, features);
    await handleCODPayment(context);
  } else {
    await checkDisabledCOD(context);
  }
}

function createCODTest(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { isSaveAddress, isCODEligible, serviceable, codFee } = features;
  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout COD test', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.cod = true;
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await handleAvailableCouponReq(context);
      await proceed(context);
      await fillUserDetails(context);
      await proceed(context);
      await handleCustomerStatusReq(context);

      await fillUserAddress(context, {
        isSaveAddress,
        isCODEligible,
        serviceable,
        codFee,
      });
      await proceed(context);
      await codTestCases(context, features, options);
    });
  });
}

module.exports = {
  createCODTest,
  codTestCases,
};
