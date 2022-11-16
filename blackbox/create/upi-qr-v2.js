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
  assertQRV2Hidden,
  goBackFromTopbar,
  cancelTransaction,
  retryTransaction,
  provideCancellationReason,
  assertQrV2Timer,
  assertQrV2TimerHidden,
  assetQrV2DowntimeCallout,
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
  handlePartialPayment,
} = require('../tests/homescreen/actions');
const { delay } = require('../../mock-api/utils.js');

const upiDowntime = {
  id: 'down_DEW7D9S10PEsl1',
  entity: 'payment.downtime',
  method: 'upi',
  begin: 1567686386,
  end: null,
  status: 'started',
  scheduled: false,
  severity: 'high',
  instrument: {},
  created_at: 1567686387,
  updated_at: 1567686387,
};
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
    partialPayment,
    silentFailure,
    persistent,
    intendedOptOut,
    disable_homescreen_qr = false,
    disable_upiscreen_qr = false,
    disable_l0_experiment,
    disable_l1_experiment,
    upiMethodDown,
    top3AppsDown,
    crossBorderCheckout,
    recurringCheckout,
    feeBearerCheckout,
    timeOut,
    pspDowntimeCallout,
    apiErrorCase,
    homeScreenQr,
    upiScreenQr,
  } = features;
  // const anyFeeBearer = feeBearer || dynamicFeeBearer;
  describe.each(
    getTestData(title, {
      options: {
        ...options,
        timeOut,
        amount: upiScreenQr && !homeScreenQr ? 6000 : 1000,
      },
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
      let qrFeatureFlags = {
        disable_homescreen_qr,
        disable_upiscreen_qr,
      };
      if (preferences.features) {
        preferences.features = { ...preferences.features, ...qrFeatureFlags };
      } else {
        preferences.features = qrFeatureFlags;
      }
      if (feeBearerCheckout) {
        preferences.fee_bearer = true;
      }
      // if (dynamicFeeBearer) {
      //   preferences.fee_bearer = true;
      //   preferences.order = modifyPreferencesForDynamicFeeBearer();
      // }
      if (upiMethodDown) {
        preferences.payment_downtime = {
          entity: 'collection',
          count: 1,
          items: [
            ...((preferences.payment_downtime &&
              preferences.payment_downtime.items) ||
              []),
            upiDowntime,
          ],
        };
      }
      if (top3AppsDown) {
        preferences.payment_downtime = {
          entity: 'collection',
          count: 1,
          items: [
            ...((preferences.payment_downtime &&
              preferences.payment_downtime.items) ||
              []),
            ...['google_pay', 'phonepe', 'paytm'].map((psp) => ({
              ...upiDowntime,
              instrument: { psp },
            })),
          ],
        };
      }
      if (pspDowntimeCallout) {
        preferences.payment_downtime = {
          entity: 'collection',
          count: 1,
          items: [
            ...((preferences.payment_downtime &&
              preferences.payment_downtime.items) ||
              []),
            {
              ...upiDowntime,
              instrument: { psp: 'paytm' },
            },
          ],
        };
      }
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
      if (homeScreenQr) {
        if (
          disable_homescreen_qr ||
          upiMethodDown ||
          top3AppsDown ||
          (options.amount > 5000 * 100 && !upiScreenQr && homeScreenQr) ||
          feeBearerCheckout
        ) {
          await assertQRV2Hidden(context, homeScreenQr);
          return;
        } else {
          await assertQRV2(context, homeScreenQr);
          if (pspDowntimeCallout) {
            await assetQrV2DowntimeCallout(context);
          }
        }
      }
      if (upiScreenQr) {
        await selectPaymentMethod(context, 'upi');
        if (
          disable_upiscreen_qr ||
          upiMethodDown ||
          top3AppsDown ||
          feeBearerCheckout
        ) {
          await assertQRV2Hidden(context);
          return;
        } else {
          await assertQRV2(context);
          if (pspDowntimeCallout) {
            await assetQrV2DowntimeCallout(context);
          }
        }
      }

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
       * With a new change ot
       * SHOW QR (Remove auto generate QR), QR will not be generated until unless user opts
       * and every cancel reason is intended only
       * P.S REFRESH QR and SHOW QR are same component but different Text Content
       */
      await clickOnRefreshButton(context);
      /**
       * Chart API calls are ignored, hence don't try to resolve QR image calls
       * since we are not resolving QR image, the view will be with loading button only
       */
      await respondQrV2APIAndAssertElements(context, timeOut);

      if (persistent) {
        /**
         * QR must be persistent and running as is
         */
        if (upiScreenQr) {
          await goBackFromTopbar(context);
          await selectPaymentMethod(context, 'upi');
          await assertQRV2(context);
        }
        if (homeScreenQr) {
          await assertQRV2(context, homeScreenQr);
          await selectPaymentMethod(context, 'upi');
          await goBackFromTopbar(context);
        }
        /**
         * If homescreen, the user
         */
      }
      if (intendedOptOut) {
        if (homeScreenQr) {
          await selectPaymentMethod(context, 'upi');
        }
        await attemptNewVPACollectPayment(context, 'intended_payment_opt_out');
        if (intendedOptOut) {
          await respondToQRV2PaymentStatus(context, null, 'created');
          await cancelPaymentFullyAttemptRetry(context);
          await clickOnRefreshButton(context);
          await respondQrV2APIAndAssertElements(context, timeOut);
          await attemptNewVPACollectPayment(
            context,
            'intended_payment_opt_out'
          );
        }
        return;
      }
      if (silentFailure || apiErrorCase) {
        await respondToQRV2PaymentStatus(context, null, 'error');
        if (apiErrorCase) {
          await retryTransaction(context);
        }
        assertRefreshButton(context);
      } else {
        await respondToQRV2PaymentStatus(context);
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

async function respondQrV2APIAndAssertElements(context, timeOut) {
  await respondToQRV2Ajax(context);

  if (timeOut && timeOut < 11 * 60 + 55) {
    await assertQrV2TimerHidden(context);
  } else {
    await assertQrV2Timer(context);
  }
}
