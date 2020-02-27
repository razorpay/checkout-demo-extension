const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectBank,
  assertNetbankingPage,
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleValidationRequest,
  passRequestNetbanking,
  handleMockSuccessDialog,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

function getFeaturesString(features) {
  const keys = Object.keys(features).filter(feature => features[features]);

  return keys.join(', ');
}

const defaultOptions = {
  timeout: false,
  keyless: false,
  feeBearer: false,
  callbackUrl: false,
};

module.exports = function(testFeatures) {
  testFeatures = {
    ...defaultOptions,
    ...testFeatures,
  };

  const { feeBearer, timeout, keyless, callbackUrl } = testFeatures;

  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: 200,
    personalization: false,
  };

  if (keyless) {
    delete options.key;
    options.order_id = 'rzp_test_1DP5mmOlF5G5ag';
  }

  if (timeout) {
    options.timeout = 3;
  }

  if (callbackUrl) {
    options.callback_url =
      'http://www.merchanturl.com/callback?test1=abc&test2=xyz';
    options.redirect = true;
  }

  const preferences = {};

  if (feeBearer) {
    preferences.fee_bearer = true;
  }

  describe.each(
    getTestData(getFeaturesString(testFeatures), {
      options,
      preferences,
    })
  )('Netbanking tests', ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      await assertBasicDetailsScreen(context);
      await fillUserDetails(context);
      await proceed(context);
      await assertUserDetails(context);
      await assertEditUserDetailsAndBack(context);
      await assertPaymentMethods(context);
      await selectPaymentMethod(context, 'netbanking');
      await assertNetbankingPage(context);
      await selectBank(context, 'SBIN');

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'netbanking');

        return;
      }

      await submit(context);

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (timeout) {
        await handleValidationRequest(context, 'fail');
        await verifyTimeout(context, 'netbanking');

        return;
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, {
          method: 'netbanking',
          bank: 'SBIN',
        });
      } else {
        await passRequestNetbanking(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
