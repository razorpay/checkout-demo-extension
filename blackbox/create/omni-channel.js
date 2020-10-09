const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,
  submit,
  expectRedirectWithCallback,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  viewOffers,
  selectOffer,

  // Partial Payment
  verifyPartialAmount,
  verifyFooterText,

  //omnichannel
  verifyOmnichannelPhoneNumber,
  selectUPIMethod,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../actions/common');

const {
  // Generic
  proceed,

  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,

  // Partial Payments
  handlePartialPayment,

  //DownTime
  verifyMethodWarned,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'omni-channel',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    downtimeHigh,
    downtimeLow,
    offers,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Omni-Channel tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayment) {
        await handlePartialPayment(context, '100');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      await selectPaymentMethod(context, 'upi');

      if (downtimeHigh || downtimeLow) {
        await verifyMethodWarned(context, 'UPI', 'upi');
      }

      await selectUPIMethod(context, 'omnichannel');
      await verifyOmnichannelPhoneNumber(context);

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        if (!feeBearer) {
          await verifyDiscountPaybleAmount(context, '₹ 1,980');
        }
        // await verifyDiscountAmountInBanner(context, '₹ 1,980'); /* Issue reported CE-963*/
        await verifyDiscountText(context, 'You save ₹20');
      }

      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      await submit(context);

      if (feeBearer) {
        await handleFeeBearer(context, page);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'upi' });
      } else {
        await respondToUPIAjax(context);
        await respondToUPIPaymentStatus(context);
      }
    });
  });
};
