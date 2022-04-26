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
  proceedOneCC,
} = require('../../actions/one-click-checkout/common');
const { selectPaymentMethod } = require('../../tests/homescreen/actions');
const {
  fillUserAddress,
  handleShippingInfo,
} = require('../../actions/one-click-checkout/address');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');
const {
  selectBank,
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
    skip,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout coupons test', ({ preferences, title, options }) => {
    if (skip) {
      test.skip(title, () => {});
      return;
    }
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await handleAvailableCouponReq(context, availableCoupons);
      await handleCouponView(context);
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
        await delay(200);
        await proceedOneCC(context);
        await handleVerifyOTPReq(context);
        await handleAvailableCouponReq(context, availableCoupons);
        await handleApplyCouponReq(context, true, discountAmount);
        await handleShippingInfo(context, false, true);
        await handleAvailableCouponReq(context, availableCoupons);
        await delay(400);
      } else {
        if (couponValid || availableCoupons) {
          await verifyValidCoupon(context, features);
        } else {
          await verifyInValidCoupon(context, amount);
        }

        if (removeCoupon) {
          await handleRemoveCoupon(context, amount);
        }

        await fillUserDetails(context);
        await delay(200);
        await proceedOneCC(context);
        await handleCustomerStatusReq(context);
        await fillUserAddress(context, { isSaveAddress, serviceable });
      }
      await proceedOneCC(context);
      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context);
      await delay(200);
      await handleFeeSummary(context, features);
      await selectPaymentMethod(context, 'netbanking');
      await selectBank(context, 'SBIN');
      await proceedOneCC(context);
      await passRequestNetbanking(context);
      await handleMockSuccessDialog(context);
    });
  });
};
