const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  expectRedirectWithCallback,
  respondToErrorMessage,

  //TPV
  verifyAutoSelectBankTPV,

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
  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');
const { delay } = require('../util.js');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'tpv',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    offers,
    personalization,
    optionalContact,
    optionalEmail,
    invalidOrder,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('TPV tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }

      if (callbackUrl) {
        preferences.order.method = 'netbanking';
      }

      if (invalidOrder) {
        preferences.methods = {
          ...preferences.methods,
          upi: false,
          netbanking: undefined,
        };
      }

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment;

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (invalidOrder) {
        // for invalid order the retry option will not be available, and closes checkout on click instead
        await respondToErrorMessage(context);
        return;
      }

      if (!isHomeScreenSkipped && feeBearer) {
        await assertBasicDetailsScreen(context);
        await verifyFooterText(context, 'PAY');
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayment) {
        await handlePartialPayment(context, '100');
      }

      if (!missingUserDetails) {
        await verifyAutoSelectBankTPV(context, 'State Bank of India');
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

      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      await submit(context);

      if (feeBearer) {
        await handleFeeBearer(context);
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
