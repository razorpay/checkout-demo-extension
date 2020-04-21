const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  selectCurrencyAndVerifyAmount,
  submit,
  handleValidationRequest,
  handleCardValidation,
  handleMockSuccessDialog,
  expectRedirectWithCallback,
  expectDCCParametersInRequest,

  //Saved Cards
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  viewOffers,
  selectOffer,

  // Partial Payment
  verifyPartialAmount,

  // Personalization
  selectPersonalizedCard,
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
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'saved-cards',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    offers,
    personalization,
    optionalContact,
    optionalEmail,
    dcc,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Saved Cards tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'Card',
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

      if (personalization) {
        await selectPersonalizedCard(context);
      } else {
        await selectPaymentMethod(context, 'card');
      }

      await handleCustomerCardStatusRequest(context);
      await typeOTPandSubmit(context);
      await respondSavedCards(context, { dcc });

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,980');
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹20');
        await delay(400);
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'card');

        return;
      }

      await selectSavedCardAndTypeCvv(context);

      if (dcc) {
        await selectCurrencyAndVerifyAmount(context);
        await submit(context);
        await expectDCCParametersInRequest(context);

        return;
      }

      await submit(context);

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'card' });
      } else {
        await handleCardValidation(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
