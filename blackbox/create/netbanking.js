const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  verifyTimeout,
  handleFeeBearer,
  submit,
  handleValidationRequest,
  passRequestNetbanking,
  handleMockSuccessDialog,
  expectRedirectWithCallback,

  // Netbanking
  selectBank,
  assertNetbankingPage,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  verifyLowDowntime,
  viewOffers,
  selectOffer,

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

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'netbanking',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    downtime,
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
  )('Netbanking tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }

      let bank = 'SBIN';

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'Netbanking',
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
        await verifyPersonalizationText(context, 'netbanking');
        await selectPersonalizationPaymentMethod(context, '1');

        bank = 'HDFC';
      } else {
        await selectPaymentMethod(context, 'netbanking');
        await assertNetbankingPage(context);

        if (downtime) {
          await selectBank(context, 'ICIC');
          await verifyLowDowntime(context, 'ICICI Bank', 'netbanking');
          await selectBank(context, 'HDFC');
          await verifyLowDowntime(context, 'HDFC Bank', 'netbanking');

          bank = 'HDFC';
        } else {
          await selectBank(context, 'SBIN');
        }
      }

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,980');
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹ 20');
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
          bank,
        });
      } else {
        await passRequestNetbanking(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};