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
  assertShippingOptionsListActions,
} = require('../../actions/one-click-checkout/common');
const {
  fillUserAddress,
  assertUnserviceableAddress,
} = require('../../actions/one-click-checkout/address');
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
    singleGC,
    multipleGC,
    restrictCoupon,
    showCoupons,
    couponsDisabled,
    shippingOptions,
    multipleShipping,
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
        if (singleGC || multipleGC) {
          preferences['1cc'] = {
            configs: {
              one_cc_auto_fetch_coupons: true,
              one_cc_gift_card: singleGC || multipleGC,
              one_cc_multiple_gift_card: multipleGC,
              one_cc_gift_card_restrict_coupon: restrictCoupon,
            },
          };
        }
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
            handleShippingInfo(context, {
              isCODEligible: true,
              shippingOptions,
            });
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
        await delay(200);
        await proceedOneCC(context);
        await handleCustomerStatusReq(context);
        await fillUserAddress(context, {
          saveAddress,
          serviceable,
          isCODEligible: true,
          shippingOptions,
        });
        await delay(400);
        if (!serviceable) {
          await assertUnserviceableAddress(context, true);
          return;
        }
        if (multipleShipping) {
          await proceedOneCC(context);
          await assertShippingOptionsListActions(context, true, {
            shippingOptions,
            serviceable,
          });
        } else {
          await proceedOneCC(context);
        }
        await delay(400);
        await mockPaymentSteps(context, options, features, true, method);
        await delay(200);
      });
    }
  );
};
