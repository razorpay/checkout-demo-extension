const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  verifyValidCoupon,
  verifyInValidCoupon,
  handleAvailableCouponReq,
  handleRemoveCoupon,
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
const {
  selectBank,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
} = require('../../actions/common');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const {
    couponValid,
    amount,
    availableCoupons,
    removeCoupon,
    serviceable,
    isSaveAddress,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout coupons test', ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await handleAvailableCouponReq(context, availableCoupons);

      if (couponValid || availableCoupons) {
        await verifyValidCoupon(context, features);
      } else {
        await verifyInValidCoupon(context, amount);
      }

      if (removeCoupon) {
        await handleRemoveCoupon(context, amount);
      }

      await proceed(context);
      await fillUserDetails(context);
      await proceed(context);
      await handleCustomerStatusReq(context);
      await fillUserAddress(context, { isSaveAddress, serviceable });
      await proceed(context);
      await handleThirdWatchReq(context);
      await handleUpdateOrderReq(context, options.order_id);
      await delay(200);
      await handleFeeSummary(context, features);
      await selectPaymentMethod(context, 'netbanking');
      await selectBank(context, 'SBIN');
      await submit(context, false);
      await passRequestNetbanking(context);
      await handleMockSuccessDialog(context);
    });
  });
};
