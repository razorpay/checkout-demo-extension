const querystring = require('querystring');
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
  viewOffers,
  selectOffer,

  //Downtime
  verifyMethodWarned,
  downtimeHighAlert,

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
} = require('../tests/homescreen/actions');

const PARTNER_CONFIG = {
  KEY_ID: 'rzp_live_partner_BOD2gzSGkmxqyZ',
  ORDER_ID: 'order_HXFrTfbcka1JDT',
  ACCOUNT_ID: 'acc_BPKlDRz7RMvA4A',
};

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'netbanking',
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
    verifyPartnerMerchantPayload,
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

      if (verifyPartnerMerchantPayload) {
        options.key = PARTNER_CONFIG.KEY_ID;
        options.order_id = PARTNER_CONFIG.ORDER_ID;
        options.account_id = PARTNER_CONFIG.ACCOUNT_ID;
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

        if (downtimeHigh || downtimeLow) {
          await selectBank(context, 'HDFC');
          await verifyMethodWarned(context, 'netbanking', 'bank', 'HDFC');

          bank = 'HDFC';
        } else {
          await selectBank(context, 'SBIN');
        }
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

      if (callbackUrl && timeout) {
        await verifyTimeout(context, 'netbanking');
        return;
      }

      await submit(context, downtimeHigh);

      if (downtimeHigh) {
        await downtimeHighAlert(context);
      }

      if (feeBearer) {
        await delay(200);
        await handleFeeBearer(context);
      }

      if (timeout) {
        await handleValidationRequest(context, 'fail');
        await verifyTimeout(context, 'netbanking');

        return;
      }

      if (verifyPartnerMerchantPayload) {
        const req = await context.expectRequest();
        const body = querystring.parse(req.body);
        expect(body.account_id).toEqual(PARTNER_CONFIG.ACCOUNT_ID);
        expect(body.key_id).toEqual(PARTNER_CONFIG.KEY_ID);
        expect(body.order_id).toEqual(PARTNER_CONFIG.ORDER_ID);
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
