const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  selectUPIMethod,
  enterUPIAccount,
  submit,
  handleUPIAccountValidation,
  respondToCancellationRequest,
  handleFeeBearer,
  assertDynamicFeeBearer,
  modifyPreferencesForDynamicFeeBearer,
  handleSaveVpaRequest,
  // QR Scanner
  respondToUPIAjax,
  responseWithQRV2Image,
  validateQRImage,
  responseWithQRImage,
  respondToQRV2PaymentStatus,
  respondToQRV2Ajax,
  assertRefreshButton,
  clickOnRefreshButton,
  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  verifyMethodWarned,
  viewOffers,
  selectOffer,
  assertQRV2,
  goBackFromTopbar,
  cancelTransaction,
  retryTransaction,
  provideCancellationReason,
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
  selectQRScanner,
  assertEditUserDetailsAndBack,

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
} = require('../tests/homescreen/actions');
const { delay } = require('../../mock-api/utils.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-qr',
    testFeatures
  );

  const {
    optionalContact,
    optionalEmail,
    /**
     * Comments are intentional and would be enabled once the feature is scoped for all flows
     */
    // personalization,
    // feeBearer,
    // dynamicFeeBearer,
    offers,
    partialPayments,

    silentFailure,
    persistent,
    intendedOptOut,
    unintendedOptOut,
  } = features;
  // const anyFeeBearer = feeBearer || dynamicFeeBearer;
  describe.skip.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('UPI QR V2 tests', ({ preferences, title, options }) => {
    test(title, async () => {
      // if (personalization) {
      //   if (preferences.customer) {
      //     preferences.customer.contact = '+918888888881';
      //   }
      // }
      preferences.methods.upi = true;
      if (preferences.features) {
        preferences.features.disable_l1_qr = false;
      } else {
        preferences.features = { disable_l1_qr: false };
      }
      // if (dynamicFeeBearer) {
      //   preferences.fee_bearer = true;
      //   preferences.order = modifyPreferencesForDynamicFeeBearer();
      // }
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'upi',
        networkInterceptorConfig: {
          ignorePattern: /chart.googleapis.com/i,
        },
        experiments: { upi_qr_on_l1_percentage_5: 1 },
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayments; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayments) {
        await handlePartialPayment(context, '100');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      // if (dynamicFeeBearer) {
      //   await assertDynamicFeeBearer(context, 1, true);
      // }
      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }
      await assertPaymentMethods(context);

      // if (personalization) {
      //   await verifyPersonalizationText(context, 'qr');
      //   await selectPersonalizationPaymentMethod(context, '1');
      // } else {
      await selectPaymentMethod(context, 'upi');
      await assertQRV2(context);

      // }

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,980');
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹20');
      }

      // if (anyFeeBearer) {
      //   await handleFeeBearer(context);
      // }

      /**
       * Chart API calls are ignored, hence don't try to resolve QR image calls
       * since we are not resolving QR image, the view will be with loading button only
       */
      await respondToQRV2Ajax(context);

      if (persistent) {
        /**
         * QR must be persistent and running as is
         */
        await goBackFromTopbar(context);
        await selectPaymentMethod(context, 'upi');
        await assertQRV2(context);
      }
      if (unintendedOptOut || intendedOptOut) {
        await attemptNewVPACollectPayment(
          context,
          'unintended_payment_opt_out'
        );
        if (intendedOptOut) {
          await respondToQRV2PaymentStatus(context, null, 'created');
          await cancelPaymentFullyAttemptRetry(context);
          await clickOnRefreshButton(context);
          await respondToQRV2Ajax(context);
          await attemptNewVPACollectPayment(
            context,
            'intended_payment_opt_out'
          );
        }
        return;
      }
      if (silentFailure) {
        respondToQRV2PaymentStatus(context, null, 'error');
        // assertRefreshButton(context);
      } else {
        respondToQRV2PaymentStatus(context);
      }
    });
  });
};
async function cancelPaymentFullyAttemptRetry(context) {
  await cancelTransaction(context);
  await provideCancellationReason(context, 'upi');
  await retryTransaction(context);
}

async function attemptNewVPACollectPayment(context, expectedCancelReason) {
  await selectUPIMethod(context, 'new');
  await enterUPIAccount(context, 'BHIM@upi');
  await submit(context);
  await respondToCancellationRequest(context, expectedCancelReason);
  await handleUPIAccountValidation(context, 'BHIM@upi');
  await handleSaveVpaRequest(context);
}
