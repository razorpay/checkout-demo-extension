const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  setPreferenceForOffer,
  handleFeeBearer,
  submit,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  expectRedirectWithCallback,

  // UPI
  selectUPIMethod,
  handleUPIAccountValidation,
  enterUPIAccount,
  handleSaveVpaRequest,

  // Offers
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
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

  //Downtime
  verifyMethodWarned,
  verifyMethodDisabled,

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-otm',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    downtimeLow,
    downtimeHigh,
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
  )('UPI OTM Collect tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi_otm = true;
      preferences.methods.card = false;
      preferences.methods.upi = false;

      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
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

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      if (personalization) {
        await verifyPersonalizationText(context, 'upi_otm');
        await selectPersonalizationPaymentMethod(context, 1);
      } else {
        await selectPaymentMethod(context, 'upi_otm');

        if (downtimeHigh || downtimeLow) {
          await verifyMethodWarned(context, 'UPI', 'upi_otm');
        }
        await selectUPIMethod(context, 'new', 'upi_otm');
        await enterUPIAccount(context, 'saranshgupta1995@okaxis', 'upi_otm');
      }
      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        await verifyDiscountPaybleAmount(context, '₹ 1,990');
        await verifyDiscountAmountInBanner(context, '₹ 1,990');
        await verifyDiscountText(context, 'You save ₹10');
      }

      await submit(context);

      await handleUPIAccountValidation(context, 'BHIM@upi');
      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'upi_otm' });
      } else {
        await handleSaveVpaRequest(context);
        await respondToUPIPaymentStatus(context);
      }
    });
  });
};
