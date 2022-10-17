const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  assertDynamicFeeBearer,
  modifyPreferencesForDynamicFeeBearer,
  submit,
  handleValidationRequest,
  handleMockSuccessDialog,
  selectCurrencyAndVerifyAmount,
  expectDCCParametersInRequest,
  expectRedirectWithCallback,
  respondCurrencies,
  expectAVSParametersInRequest,

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
  retryTransactionWithPaypal,

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
  verifyOfferTerms,
  // Partial Payment
  verifyPartialAmount,
  verifyFooterText,
  fillAVSForm,
  verifyAmount,
  assertAVSFormData,
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
const { delay } = require('../util.js');

const {
  respondToPaymentFailure,
  selectConsentCollectorForTokenization,
} = require('../actions/card-actions');
const {
  expectStatesAPI,
  expectCountriesAPI,
} = require('../actions/avs-countries-states');

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
    avs,
    remember_customer,
    validateRemoveOfferCta,
    AVSPrefillData,
    withSiftJS,
    dynamicFeeBearer,
    retryWithPaypal,
    internationalCard,
  } = features;
  const anyFeeBearer = feeBearer || dynamicFeeBearer;
  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Cards tests', ({ preferences, title, options }) => {
    if (remember_customer) {
      options.remember_customer = remember_customer;
    }

    if (dynamicFeeBearer) {
      preferences.fee_bearer = true;
      preferences.order = modifyPreferencesForDynamicFeeBearer();
    }

    if (typeof AVSPrefillData === 'object' && AVSPrefillData) {
      options.prefill = { ...(options.prefill || {}), ...AVSPrefillData };
    }

    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'Card',
        experiments: { cards_separation: 0 },
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
      if (dynamicFeeBearer) {
        await assertDynamicFeeBearer(context, 1);
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
        internationalCard,
      });

      if (recurringOrder && options.remember_customer) {
        await selectConsentCollectorForTokenization(context);
      }

      if (dcc) {
        await selectCurrencyAndVerifyAmount({
          context,
          currency: 'USD',
          isAVS: avs,
          withSiftJS,
        });
        // if AVS check for extra flow
        if (avs) {
          await submit(context);
          if (!AVSPrefillData) {
            await fillAVSForm({ context });
          } else {
            // assert data from prefill options
            await expectCountriesAPI(context);
            await expectStatesAPI(context);
            await assertAVSFormData(context);
          }
          // verify footer amount with currency
          await verifyAmount(context, 'USD', false);
          return;
        }

        await submit(context);
        // expect AVS paramter if enabled
        await expectDCCParametersInRequest(context, 'USD', avs);
        return;
      } else if (internationalCard) {
        await respondCurrencies(context, avs);
      }

      if (!feeBearer && offers) {
        if (validateRemoveOfferCta) {
          //apply
          await viewOffers(context);
          await selectOffer(context, '1');
          await verifyOfferApplied(context);
          // since there is a validation going on, missing it causes test case failure
          await validateCardForOffer(context);

          //validate terms and conditions
          await viewOffers(context);
          await verifyOfferTerms(context, '1');

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

      if (anyFeeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (options.currency === 'USD') {
        await verifyFooterText(context, 'Pay $ 2');
      }

      await submit(context);

      /**
       * if AVS feature flag is enabled with DCC flag
       */
      if (!dcc && avs && internationalCard) {
        if (!AVSPrefillData) {
          // skip filling of data
          await fillAVSForm({ context });
        } else {
          // assert data from saved card
          await expectCountriesAPI(context);
          await expectStatesAPI(context);
          await assertAVSFormData(context);
        }
        await submit(context);
        if (AVSPrefillData) {
          await expectAVSParametersInRequest(context);
        }
      }

      if (options.currency !== 'INR') {
        await agreeToAMEXCurrencyCharges(context);
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'card');

        return;
      }

      if (anyFeeBearer) {
        await handleFeeBearer(context, page);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'card' });
      } else if (retryWithPaypal) {
        // Assert paypal as retry payment method if card payment failed
        // Raise card payment failure exception
        await respondToPaymentFailure(context);
        // Retry using paypal method
        await retryTransactionWithPaypal(context);
        await submit(context);
      } else {
        if (dynamicFeeBearer) {
          await assertDynamicFeeBearer(context, 2);
        }
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

        if (anyFeeBearer) {
          await handleFeeBearer(context);
        }
        await handleCardValidation(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
