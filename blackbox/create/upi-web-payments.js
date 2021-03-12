const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
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

  //Downtime
  verifyMethodWarned,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-web-payments',
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
  )('UPI Web Payments tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }
      await page.evaluateOnNewDocument(() => {
        class PaymentRequest {
          constructor() {}

          canMakePayment() {
            return Promise.resolve(true);
          }

          show() {
            const successPayload = {
              requestId: 'd16076cc-db82-4ced-8b88-a0608ea37f51',
              methodName: 'https://tez.google.com/pay',
              details: {
                tezResponse:
                  '{"Status":"SUCCESS","amount":"1.00","txnRef":"FJQDoV8cnH20T3","toVpa":"razorpay.pg@hdfcbank","txnId":"ICI100037bf0ff743659c782aeacde83b86","responseCode":"0"}',
                txnId: 'ICI100037bf0ff743659c782aeacde83b86',
                responseCode: '0',
                ApprovalRefNo: '',
                Status: 'SUCCESS',
                txnRef: 'FJQDoV8cnH20T3',
                TrtxnRef: 'FJQDoV8cnH20T3',
                signature:
                  '3045022060e893330caf8a0309b87e33dd98c920cd36e08ae9d9329b26175158ffefc06a02210089127a4e46515fde75619489f65f3372c8a2e2631eacf1736f781e3e71dbf81d',
                signatureKeyId: 'PAYMENT_RESPONSE_V1',
              },
              shippingAddress: null,
              shippingOption: null,
              payerName: null,
              payerEmail: null,
              payerPhone: null,
            };

            let payload = successPayload;

            return Promise.resolve({
              ...payload,
              complete: () => {},
            });
          }
        }

        window.PaymentRequest = PaymentRequest;
      });

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

      if (!feeBearer && offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        if (!feeBearer) {
          await verifyDiscountPaybleAmount(context, '₹ 1,990');
        }
        await verifyDiscountAmountInBanner(context, '₹ 1,990');
        await verifyDiscountText(context, 'You save ₹10');
      } else {
        await selectPaymentMethod(context, 'upi');
      }

      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      await selectUPIApp(context, '1');
      if (downtimeHigh || downtimeLow) {
        await verifyMethodWarned(context, 'UPI', 'upi', 'psp');
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

      // if (offers) {
      //   await respondAndVerifyIntentRequest(
      //     context,
      //     'offer_id=' + preferences.offers[0].id
      //   );
      // } else {
      await respondAndVerifyIntentRequest(context, { isBrowserIntent: true });
      // }
    });
  });
};
