const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleAvailableCouponReq,
  verifyValidCoupon,
  handleCouponView,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
  proceedOneCC,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
} = require('../../actions/one-click-checkout/common');
const { selectPaymentMethod } = require('../../tests/homescreen/actions');
const {
  fillUserAddress,
  handleCustomerAddressReq,
} = require('../../actions/one-click-checkout/address');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');
const {
  handleCODPayment,
  checkDisabledCOD,
} = require('../../actions/one-click-checkout/cod');
const {
  handleGiftCard,
  checkGCDisabledOnCOD,
} = require('../../actions/one-click-checkout/gift-card');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    {
      isCODEligible: true,
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
      couponCode: 'WELCOME10',
      showCoupons: true,
      ...testFeatures,
      codFee: testFeatures.codFee ? 1 * 100 : null,
      shippingFee: testFeatures.shippingFee ? 1 * 100 : null,
    }
  );

  const {
    saveAddress,
    isCODEligible,
    serviceable,
    codFee,
    isThirdWatchEligible,
    singleGC,
    multipleGC,
    restrictCOD,
    restrictGC,
    couponValid,
    shippingFee,
    availableCoupons,
    showCoupons,
    billingEnabled,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout COD test', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.cod = true;

      if (singleGC || multipleGC) {
        preferences = {
          ...preferences,
          '1cc': {
            configs: {
              one_cc_auto_fetch_coupons: !!showCoupons,
              one_cc_capture_billing_address: !!billingEnabled,
              one_cc_gift_card: singleGC || multipleGC,
              one_cc_multiple_gift_card: multipleGC,
              one_cc_gift_card_cod_restrict: restrictCOD || restrictGC,
            },
          },
        };
      }

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      if (showCoupons) {
        await handleAvailableCouponReq(context, availableCoupons);
      }
      if (couponValid) {
        await handleCouponView(context);
        await delay(200);
        await verifyValidCoupon(context, features);
      }
      await fillUserDetails(context);
      await delay(200);
      await proceedOneCC(context);
      await delay(200);
      await handleCustomerStatusReq(context);

      await fillUserAddress(context, {
        saveAddress,
        isCODEligible,
        serviceable,
        shippingFee,
        codFee,
      });
      await delay(200);
      await proceedOneCC(context);
      await delay(200);
      if (saveAddress) {
        await handleCreateOTPReq(context);
        await handleTypeOTP(context);
        await proceedOneCC(context);
        await handleVerifyOTPReq(context);
        await handleCustomerAddressReq(context);
      }
      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context, true);

      if (isCODEligible) {
        features.isSelectCOD = true;
        await delay(200);
        if (restrictCOD) {
          await handleGiftCard(context, features);
        } else {
          await selectPaymentMethod(context, 'cod');
          await checkGCDisabledOnCOD(context, features);
          await proceedOneCC(context, false);
          await delay(200);
          await handleFeeSummary(context, features);
          await handleCODPayment(context);
        }
      } else {
        await checkDisabledCOD(context);
      }
    });
  });
};
