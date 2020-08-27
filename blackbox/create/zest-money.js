const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,
  submit,
  expectRedirectWithCallback,

  // Offers
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  typeOTPandSubmit,
  handleOtpVerificationForCardlessEMI,
  selectZestMoneyEMIPlan,
  handleCardlessEMIPaymentCreation,

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

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'zest-money',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Zest Money tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.cardless_emi = {
        earlysalary: true,
        zestmoney: true,
        flexmoney: true,
      };

      // ZestMoney is disabled on feeBearer merchants
      if (feeBearer) {
        return;
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
        await handlePartialPayment(context, '3000');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      await selectPaymentMethod(context, 'cardless_emi');

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 3,000');
      }
      await selectCardlessEMIOption(context, 'zestmoney');
      if (feeBearer) {
        await handleFeeBearer(context);
      }
      await handleCardlessEMIValidation(context);
      await typeOTPandSubmit(context);
      await handleOtpVerificationForCardlessEMI(context);
      await selectZestMoneyEMIPlan(context, 1);
      await submit(context);
      if (feeBearer) {
        await handleFeeBearer(context);
      }
      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'cardless_emi' });
      } else {
        await handleCardlessEMIPaymentCreation(context);
      }
    });
  });
};
