const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleValidationRequest,
  handleMockSuccessDialog,
  selectCurrencyAndVerifyAmount,
  expectDCCParametersInRequest,
  expectRedirectWithCallback,

  // Card Payment
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  verifyErrorMessage,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  retryTransaction,
  selectPersonalizedCard,
  agreeToAMEXCurrencyCharges,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  viewOffers,
  validateCardForOffer,
  selectOffer,
  removeOffer,
  verifyOfferNotApplied,
  // Partial Payment
  verifyPartialAmount,
  verifyFooterText,
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
const { delay } = require('../../mock-api/utils.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'cards',
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
    recurringOrder,
    dcc,
    remember_customer,
    validateRemoveOfferCta,
  } = features;
  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Cards tests', ({ preferences, title, options }) => {
    if (remember_customer) {
      options.remember_customer = remember_customer;
    }
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'Card',
        experiments: {
          cards_separation: 0,
        },
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV
      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }
      await delay(20000);
      if (partialPayment) {
        await handlePartialPayment(context, '100');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (recurringOrder && options.remember_customer) {
        await handleCustomerCardStatusRequest(context);
        await typeOTPandSubmit(context);
        await respondSavedCards(context);
      }

      if (!missingUserDetails && !recurringOrder) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      if (!recurringOrder) {
        await assertPaymentMethods(context);

        await selectPaymentMethod(context, 'card');
      }
      if (optionalContact) {
        // check remember me should be hide
        await page.waitForFunction(() => {
          return !document.getElementById('should-save-card');
        });
      }

      await enterCardDetails(context, {
        recurring: !!recurringOrder,
        dcc,
      });

      if (dcc) {
        await selectCurrencyAndVerifyAmount(context);
        await submit(context);
        await expectDCCParametersInRequest(context);

        return;
      }

      if (!feeBearer && offers) {
        if (validateRemoveOfferCta) {
          //apply
          await viewOffers(context);
          await selectOffer(context, '1');
          await verifyOfferApplied(context);
          // since there is a validation going on, missing it causes test case failure
          await validateCardForOffer(context);

          // remove
          await viewOffers(context);
          await removeOffer(context, '1');
          await verifyOfferNotApplied(context);
        }

        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);

        if (!feeBearer) {
          await verifyDiscountPaybleAmount(context, '₹ 1,980');
        }
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹20');
        await validateCardForOffer(context);
      }

      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (options.currency === 'USD') {
        await verifyFooterText(context, 'Pay $ 2');
      }

      await submit(context);
      if (options.currency !== 'INR') {
        await agreeToAMEXCurrencyCharges(context);
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'card');

        return;
      }

      if (feeBearer) {
        await handleFeeBearer(context, page);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'card' });
      } else {
        await handleCardValidation(context);
        await handleMockFailureDialog(context);
        await verifyErrorMessage(
          context,
          'The payment has already been processed'
        );
        await retryTransaction(context);
        await submit(context);
        if (options.currency !== 'INR') {
          await agreeToAMEXCurrencyCharges(context);
        }
        if (feeBearer) {
          await handleFeeBearer(context);
        }
        await handleCardValidation(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
