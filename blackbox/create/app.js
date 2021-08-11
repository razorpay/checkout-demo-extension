const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const {
  openCheckoutWithNewHomeScreen,
  openSdkCheckoutWithNewHomeScreen,
} = require('../tests/homescreen/open');
const {
  handleAppCreatePayment,
  handleCREDUserValidation,
  handleAppPaymentStatus,
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

const { delay } = require('../util');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'app',
    testFeatures
  );

  const { app, flow, config, platform, testName } = testFeatures;

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    offers,
    optionalContact,
    optionalEmail,
    personalization,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )(`App - ${testName}`, ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }

      const apps = [];

      if (app === 'google_pay') {
        preferences.methods.app = { google_pay: true };
        preferences.methods.gpay = true;
        apps.push('google_pay');
      } else if (app === 'cred') {
        preferences.methods.app = { cred: true };
        if (flow === 'intent') {
          // This will send cred inside handleMessage under "uri_data"
          // It essentially means that app is installed on the device.
          apps.push('cred');
        }
      }

      if (config) {
        options.config = testFeatures.config;
      }

      let params;

      if (platform === 'android') {
        params = {
          platform: 'android',
          library: 'checkoutjs',
          version: '1.5.17',
        };
      } else if (platform === 'ios') {
        params = {
          platform: 'ios',
          library: 'checkoutjs',
          version: '?',
        };
      } else if (platform === 'web') {
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
      }

      const context = await (platform === 'web'
        ? openCheckoutWithNewHomeScreen
        : openSdkCheckoutWithNewHomeScreen)({
        page,
        options,
        preferences,
        method: 'app',
        apps,
        params,
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

      let selector;
      if (config || personalization) {
        // If making payment on the homescreen itself,
        // No need to reach the inner screens.
        selector = `.instrument[data-code=${app}]`;
      } else {
        await assertPaymentMethods(context);
        await selectPaymentMethod(context, 'card');
        await page.waitForSelector('h3.pad');
        await page.click('h3.pad');
        selector = `.instrument [value=${app}]`;
      }

      await page.waitForSelector(selector);
      await page.click(selector);
      await delay(500);

      // await proceed(context);
      // ^ Internally checks for absence of #user-details
      // but it is present in DOM for some reason,
      // so using #footer directly
      await context.page.click('#footer');
      if (app === 'cred') {
        await handleCREDUserValidation(context);
      }
      await handleAppCreatePayment(context, { app, flow, platform });

      await handleAppPaymentStatus(context, { app, flow, platform });
    });
  });
};
