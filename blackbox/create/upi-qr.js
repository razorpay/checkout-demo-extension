const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,

  // QR Scanner
  respondToUPIAjax,
  responseWithQRImage,
  validateQRImage,
  respondToUPIPaymentStatus,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  verifyMethodWarned,
  viewOffers,
  selectOffer,
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
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-qr',
    testFeatures
  );

  const {
    partialPayments,
    feeBearer,
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
  )('UPI QR tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }
      preferences.methods.upi = true;

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'upi',
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayments; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayments) {
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
        await verifyPersonalizationText(context, 'qr');
        await selectPersonalizationPaymentMethod(context, '1');
      } else {
        await selectPaymentMethod(context, 'upi');
        await selectQRScanner(context);
      }

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,980');
        await verifyDiscountAmountInBanner(context, '₹ 1,980');
        await verifyDiscountText(context, 'You save ₹20');
      }

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      await respondToUPIAjax(context, { method: 'qr' });
      await responseWithQRImage(context);
      await validateQRImage(context);
      await respondToUPIPaymentStatus(context);
    });
  });
};
