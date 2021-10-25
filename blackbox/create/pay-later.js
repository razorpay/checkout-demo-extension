const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,
  assertDynamicFeeBearer,
  modifyPreferencesForDynamicFeeBearer,
  handleValidationRequest,
  typeOTPandSubmit,
  expectRedirectWithCallback,

  // PayLater
  verifyPayLaterPaymentMode,
  selectPayLaterPaymentMode,

  // Partial Payment
  verifyPartialAmount,
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
  handlePayLaterOTPOrCustomerCardStatusRequest,

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');
const { delay } = require('../util.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'pay-later',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    optionalContact,
    optionalEmail,
    dynamicFeeBearer,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('PayLater tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.paylater = { epaylater: true };
      if (dynamicFeeBearer) {
        preferences.fee_bearer = true;
        preferences.order = modifyPreferencesForDynamicFeeBearer();
      }
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
      await delay(2000);
      if (dynamicFeeBearer) {
        await assertDynamicFeeBearer(context, 1, true);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }
      await selectPaymentMethod(context, 'paylater');
      await verifyPayLaterPaymentMode(context);
      await selectPayLaterPaymentMode(context);
      await handlePayLaterOTPOrCustomerCardStatusRequest(context);
      await typeOTPandSubmit(context, '333333');
      await handlePayLaterOTPOrCustomerCardStatusRequest(context);
      if (feeBearer || dynamicFeeBearer) {
        await handleFeeBearer(context);
      }
      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'paylater' });
      } else {
        await handleValidationRequest(context, 'pass');
      }
    });
  });
};
