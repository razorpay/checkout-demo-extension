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
  applyCoupon,
  handleApplyCouponReq,
  handleFillUserDetails,
  handleCouponView,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
  handleCreateOTPReq,
  handleVerifyOTPReq,
  handleTypeOTP,
} = require('../../actions/one-click-checkout/common');
const { selectPaymentMethod } = require('../../tests/homescreen/actions');
const {
  fillUserAddress,
  handleShippingInfo,
} = require('../../actions/one-click-checkout/address');
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
    couponCode,
    personalised,
    discountAmount,
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

      await handleCouponView(context);
      await handleAvailableCouponReq(context, availableCoupons);
      if (personalised) {
        await applyCoupon(context, couponCode);
        await handleApplyCouponReq(
          context,
          false,
          discountAmount,
          personalised
        );
        await handleFillUserDetails(context, '9952395555', 'test@gmail.com');
        await handleCreateOTPReq(context);
        await handleTypeOTP(context);
        await proceed(context);
        await handleVerifyOTPReq(context);
        await handleAvailableCouponReq(context, availableCoupons);
        await handleApplyCouponReq(context, true, discountAmount);
        await handleAvailableCouponReq(context, availableCoupons);
        await context.page.click('#footer');
        await handleShippingInfo(context, false, true);
      } else {
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
      }
      await proceed(context);
      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context);
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
