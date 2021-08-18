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
  handleAJAXRequest,

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

  // internation Currency
  selectCurrencyAndVerifyAmount,
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

module.exports = function (testFeatures = {}) {
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
    popupIframe,
    emulate,
    amountAboveLimit = false,
  } = features;

  // Paypal Currency Conversion
  const isPaypalCC = testFeatures.paypalcc;
  if (isPaypalCC && personalization) {
    options.isPaypalCC = true;
  }

  if (amountAboveLimit) {
    options.amount = 110000 * 100; // 1.1L
  }

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
        emulate,
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
        if (isPaypalCC) {
          // handle DCC flow
          await selectCurrencyAndVerifyAmount(context);
        }
      } else {
        await selectPaymentMethod(context, 'wallet');
        await assertWalletPage(context, isPaypalCC);

        if (popupIframe) {
          await selectWallet(context, 'paytm');
        } else if (
          (!feeBearer && offers) ||
          (optionalContact && !callbackUrl)
        ) {
          await selectWallet(context, 'payzapp');
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
          }
        } else if (isPaypalCC) {
          // paypal currency
          await selectWallet(context, 'paypal');
          if (feeBearer) {
            await verifyFooterText(context, 'PAY');
          }
          // handle DCC flow
          await selectCurrencyAndVerifyAmount(context);
        } else {
          await selectWallet(context, 'freecharge');
        }
        if (feeBearer) {
          await verifyFooterText(context, 'PAY');
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
        if (!feeBearer && offers) {
          await expectRedirectWithCallback(context, {
            method: 'wallet',
            wallet: 'payzapp',
          });
        } else if (isPaypalCC) {
          await expectRedirectWithCallback(context, {
            method: 'wallet',
            wallet: 'paypal',
          });
        } else {
          await expectRedirectWithCallback(context, {
            method: 'wallet',
            wallet: 'freecharge',
          });
        }
      } else {
        if (popupIframe) {
          // handle create/ajax request
          context.forceTargetInitialization(browser);
          const popup = await context.popup();
          const popupPage = popup.page;
          await handleAJAXRequest(context, 'wallet');
          // mock popup
          /**
           * validate iframe exist in popup & confirm the opening url
           * in this case we are opening mocksharp page
           *  */

          await popupPage.waitForFunction(
            (device) => {
              const iframe = document.getElementById('frame');
              window.emulate = device;
              if (!device) {
                return iframe === null;
              }
              return (
                typeof iframe !== null &&
                iframe.contentWindow.location.href ===
                  'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag'
              );
            },
            {},
            emulate
          );

          // trigger success payment
          if (!emulate) {
            await popupPage.click('button.success');
          } else {
            await popupPage.evaluate(() => {
              const iframe = document.getElementById('frame');
              iframe.contentWindow.document
                .querySelector('button.success')
                .click();
            });
          }
          return;
        }
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

        if (isPaypalCC) {
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
