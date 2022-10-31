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
  verifyAutoFetchDisabled,
  verifyCouponWidgetHidden,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleCreateOTPReq,
  handleVerifyOTPReq,
  handleTypeOTP,
  proceedOneCC,
  mockPaymentSteps,
  handleShippingInfo,
} = require('../../actions/one-click-checkout/common');
const { fillUserAddress } = require('../../actions/one-click-checkout/address');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');

module.exports = function (testFeatures, methods = ['upi', 'card', 'cod']) {
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
    saveAddress,
    showCoupons,
    couponsDisabled,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
      methods,
    })
  )(
    'One Click Checkout coupons test',
    ({ preferences, title, options, method }) => {
      preferences.methods.upi = true;

      test(title, async () => {
        features.isSelectCOD = method === 'cod';

        const context = await openCheckoutWithNewHomeScreen({
          page,
          options,
          preferences,
        });
        if (couponsDisabled) {
          await verifyCouponWidgetHidden(context);
        }

        if (showCoupons) {
          await handleAvailableCouponReq(context, availableCoupons);
        } else {
          await verifyAutoFetchDisabled(context);
        }

        if (!couponsDisabled) {
          await handleCouponView(context);
          if (personalised) {
            await applyCoupon(context, couponCode);
            await handleApplyCouponReq(
              context,
              false,
              discountAmount,
              personalised
            );
            await handleFillUserDetails(
              context,
              '9952395555',
              'test@gmail.com'
            );
            await delay(400);
            await handleCreateOTPReq(context);
            await handleTypeOTP(context);
            await delay(200);
            await proceedOneCC(context);
            await handleVerifyOTPReq(context);
            await delay(400);
            handleApplyCouponReq(context, true, discountAmount);
            handleShippingInfo(
              context,
              {
                isCODEligible: true,
              },
              true
            );
            handleAvailableCouponReq(context, availableCoupons);
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
          }
        }

        await delay(200);
        await fillUserDetails(context);
        await proceedOneCC(context);
        await handleCustomerStatusReq(context);
        await fillUserAddress(context, {
          saveAddress,
          serviceable,
          isCODEligible: true,
        });
        await proceedOneCC(context);
        await mockPaymentSteps(context, options, features, true, method);
      });
    }
  );
};
