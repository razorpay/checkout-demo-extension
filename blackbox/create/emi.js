const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleMockSuccessDialog,
  expectRedirectWithCallback,

  //EMI
  enterCardDetails,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation,
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,

  // Offers
  verifyOfferApplied,
  viewOffers,
  selectOffer,
  setPreferenceForOffer,

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
  assertEditUserDetailsAndBack,
  selectPaymentMethod,

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'emi',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    offers,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('EMI tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (offers) {
        await setPreferenceForOffer(preferences);
      }
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
        await handlePartialPayment(context, '5120');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);
      await selectPaymentMethod(context, 'emi');
      await enterCardDetails(context);
      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '9');
        await verifyOfferApplied(context);
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 5,120');
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'emi');

        return;
      }

      await submit(context);
      if (offers) {
        await verifyEMIPlansWithOffers(context, '2');
        await selectEMIPlanWithOffer(context, '2');
      } else {
        await verifyEMIPlansWithoutOffers(context, '6');
        await selectEMIPlanWithoutOffer(context, '2');
      }
      await submit(context);

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'emi' });
      } else {
        await handleEMIValidation(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
