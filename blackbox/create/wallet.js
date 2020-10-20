const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleValidationRequest,
  expectRedirectWithCallback,

  // Wallet
  assertWalletPage,
  handleOtpVerification,
  typeOTPandSubmit,
  retryWalletTransaction,
  selectWallet,
  handleWalletPopUp,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  retryPayzappWalletTransaction,
  viewOffers,
  selectOffer,

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

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
} = require('../tests/homescreen/actions');
const { delay } = require('../util.js');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'wallet',
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
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Wallet tests', ({ preferences, title, options }) => {
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
        method: 'Wallet',
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
        await verifyPersonalizationText(context, 'wallet');
        await selectPersonalizationPaymentMethod(context, '1');
      } else {
        await selectPaymentMethod(context, 'wallet');
        await assertWalletPage(context);

        if (offers || (optionalContact && !callbackUrl)) {
          await selectWallet(context, 'payzapp');
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
          }
        } else {
          await selectWallet(context, 'freecharge');
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
          }
        }
      }

      if (!feeBearer && offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        if (!feeBearer) {
          await verifyDiscountPaybleAmount(context, '₹ 1,980');
        }
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹20');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'wallet');

        return;
      }
      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }
      await submit(context);
      if (optionalContact && !callbackUrl) {
        await handleWalletPopUp(context);
        return;
      }

      if (feeBearer && !personalization) {
        await handleFeeBearer(context);
      }

      if (timeout) {
        await handleValidationRequest(context, 'fail');
        await verifyTimeout(context, 'wallet');

        return;
      }

      if (callbackUrl) {
        if (offers) {
          await expectRedirectWithCallback(context, {
            method: 'wallet',
            wallet: 'payzapp',
          });
        } else {
          await expectRedirectWithCallback(context, {
            method: 'wallet',
            wallet: 'freecharge',
          });
        }
      } else {
        if (!feeBearer && offers) {
          await handleValidationRequest(context, 'fail');
          await retryPayzappWalletTransaction(context);
          await verifyOfferApplied(context);
          if (!feeBearer) {
            await verifyDiscountPaybleAmount(context, '₹ 1,980');
          }
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
            await verifyDiscountAmountInBanner(context, '₹ 620.54');
          } else {
            await verifyDiscountAmountInBanner(context, '₹ 1,980');
          }
          await verifyDiscountText(context, 'You save ₹20');
          await submit(context);
          if (partialPayment) {
            await verifyPartialAmount(context, '₹ 100');
          }
          await handleValidationRequest(context, 'pass');
          return;
        }

        if (!personalization) {
          await handleOtpVerification(context);
          await typeOTPandSubmit(context);
          await handleValidationRequest(context, 'fail');
          await retryWalletTransaction(context);
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
          }
          await submit(context);
        }
        if (feeBearer) {
          await handleFeeBearer(context);
        }
        await handleOtpVerification(context);
        await typeOTPandSubmit(context);
        await handleValidationRequest(context, 'pass');
      }
    });
  });
};
