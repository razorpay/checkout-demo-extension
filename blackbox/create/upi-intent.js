const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const {
  openSdkCheckoutWithNewHomeScreen,
} = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleValidationRequest,

  // UPI
  selectUPIApp,
  respondAndVerifyIntentRequest,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  viewOffers,
  selectOffer,

  // Partial Payment
  verifyPartialAmount,
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

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,

  //Downtime
  verifyMethodWarned,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-intent',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    downtimeHigh,
    downtimeLow,
    offers,
    personalization,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('UPI Intent tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }
      const context = await openSdkCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        upiApps: true,
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

      if (downtimeHigh && offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,990');
        await verifyDiscountAmountInBanner(context, '₹ 1,990');
        await verifyDiscountText(context, 'You save ₹10');
      } else {
        await selectPaymentMethod(context, 'upi');

        if (downtimeHigh || downtimeLow) {
          await verifyMethodWarned(context, 'UPI', 'upi');
          await selectUPIApp(context, '1');
        } else {
          await selectUPIApp(context, '1');
        }
      }

      if (offers && !downtimeHigh) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,990');
        await verifyDiscountAmountInBanner(context, '₹ 1,990');
        await verifyDiscountText(context, 'You save ₹10');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'netbanking');

        return;
      }

      await submit(context);
      if (feeBearer) {
        await handleFeeBearer(context, page);
      }

      if (offers) {
        await respondAndVerifyIntentRequest(
          context,
          'offer_id=' + preferences.offers[0].id
        );
      } else {
        await respondAndVerifyIntentRequest(context);
      }
    });
  });
};
