const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleAvailableCouponReq,
  handleCouponView,
  handleApplyCouponReq,
  verifyValidCoupon,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  proceedOneCC,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  handleUpdateOrderReq,
  handleFeeSummary,
} = require('../../actions/one-click-checkout/common');
const {
  fillUserAddress,
  handleCustomerAddressReq,
} = require('../../actions/one-click-checkout/address');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');
const {
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  validateCardForOffer,
} = require('../../actions/offers-actions.js');
const {
  selectPaymentMethod,
} = require('../../tests/homescreen/homeActions.js');
const { enterCardDetails } = require('../../actions/card-actions.js');
const { submit } = require('../../actions/shared-actions.js');

module.exports = function (testFeatures = {}) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    {
      ...testFeatures,
      offers: true,
      amount: 200 * 100,
      discountAmount: 10 * 100,
      couponCode: 'WELCOME10',
      showCoupons: true,
      serviceable: true,
      saveAddress: true,
      shippingFee: testFeatures.shippingFee ? 1 * 100 : null,
    }
  );

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout offers test', ({ preferences, title, options }) => {
    test(title, async () => {
      debugger;
      const availableCoupons = [];
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      context.isRedesignV15Enabled = true;

      await handleAvailableCouponReq(context, availableCoupons);

      await delay(200);
      await fillUserDetails(context);
      if (features.couponValid) {
        await handleCouponView(context);
        await verifyValidCoupon(context, features);
      }
      await delay(200);
      await proceedOneCC(context);
      await handleCustomerStatusReq(context);
      await fillUserAddress(context, { saveAddress: true, serviceable: true });
      await delay(200);
      await proceedOneCC(context);
      await handleCreateOTPReq(context);
      await handleTypeOTP(context);
      await proceedOneCC(context);
      await handleVerifyOTPReq(context);
      await handleCustomerAddressReq(context);
      await handleUpdateOrderReq(context, options.order_id);

      await selectPaymentMethod(context, 'card');
      await enterCardDetails(context, {
        recurring: false,
        dcc: false,
        internationalCard: false,
      });
      await delay(200);
      await viewOffers(context);
      await delay(200);
      await selectOffer(context, '1');
      await verifyOfferApplied(context);
      await validateCardForOffer(context);

      await handleFeeSummary(context, features);
      await proceedOneCC(context);
      await submit(context);
    });
  });
};
