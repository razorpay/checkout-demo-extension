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

  //Downtime
  verifyMethodWarned,
  downtimeHighAlert,

  // Personalization
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
} = require('../tests/homescreen/actions');
const { delay } = require('../../mock-api/utils.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-collect',
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
  )('UPI Collect tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

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
        await verifyPersonalizationText(context, 'upi');
        await selectPersonalizationPaymentMethod(context, 1);
      } else {
        if (!(downtimeHigh && offers)) {
          await selectPaymentMethod(context, 'upi');

          await selectUPIMethod(context, 'new');
          await enterUPIAccount(context, 'saranshgupta1995@okaxis');
          if (downtimeHigh || downtimeLow) {
            await verifyMethodWarned(context, 'upi', 'vpa_handle');
          }
        }
      }
      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 100');
      }

      if (!feeBearer && offers) {
        await viewOffers(context);
        await selectOffer(context, '1');
        await verifyOfferApplied(context);
        if (!feeBearer) {
          await verifyDiscountPaybleAmount(context, '₹ 1,990');
        }
        await verifyDiscountAmountInBanner(context, '₹ 1,990');
        await verifyDiscountText(context, 'You save ₹10');
      }

      if (feeBearer) {
        await verifyFooterText(context, 'PAY');
      }

      await submit(context, downtimeHigh);

      if (downtimeHigh) {
        await downtimeHighAlert(context);
      }
      await delay(500);
      await handleUPIAccountValidation(context, 'BHIM@upi');
      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'upi' });
      } else {
        await handleSaveVpaRequest(context);
        await respondToUPIPaymentStatus(context);
      }
    });
  });
};
