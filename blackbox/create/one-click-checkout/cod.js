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
const { submit, expectRedirectWithCallback } = require('../../actions/common');
const {
  handleCODPayment,
  checkDisabledCOD,
} = require('../../actions/one-click-checkout/cod');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const {
    saveAddress,
    isCODEligible,
    serviceable,
    codFee,
    isThirdWatchEligible,
    callbackUrl,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout COD test', ({ preferences, title, options }) => {
    test.skip(title, async () => {
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
        saveAddress,
        isCODEligible,
        serviceable,
        codFee,
      });
      await proceed(context);
      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context, isThirdWatchEligible);
      await delay(200);
      if (isCODEligible) {
        features.isSelectCOD = true;
        await delay(200);
        await selectPaymentMethod(context, 'cod');
        await submit(context, false);
        await handleFeeSummary(context, features);
        await handleCODPayment(context);
      } else {
        await checkDisabledCOD(context);
      }
    });
  });
};
