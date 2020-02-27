const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
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
} = require('../../../actions/common');

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

  // Partial PAyemtn
  handlePartialPayment,
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
  optionalContact: false,
  optionalEmail: false,
  downtime: false,
  offers: false,
  partialPayment: false,
};

function makeTestOptions({ partialPayment, keyless, timeout, callbackUrl }) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: 200,
    personalization: false,
  };

  if (keyless || partialPayment) {
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

  return options;
}

function makeTestPreferences({
  partialPayment,
  offers,
  feeBearer,
  optionalContact,
  optionalEmail,
  downtime,
}) {
  const preferences = {};

  if (feeBearer) {
    preferences.fee_bearer = true;
  }

  if (optionalContact || optionalEmail) {
    preferences.optional = [];

    if (optionalEmail) {
      preferences.optional.push('email');
    }

    if (optionalContact) {
      preferences.optional.push('contact');
    }
  }

  if (partialPayment) {
    preferences.order = {
      amount: 20000,
      amount_due: 20000,
      amount_paid: 0,
      currency: 'INR',
      first_payment_min_amount: null,
      partial_payment: true,
    };
  }

  if (downtime) {
    preferences.payment_downtime = {
      entity: 'collection',
      count: 2,
      items: [
        {
          id: 'down_DEW7D9S10PEsl1',
          entity: 'payment.downtime',
          method: 'netbanking',
          begin: 1567686386,
          end: null,
          status: 'started',
          scheduled: false,
          severity: 'high',
          instrument: {
            bank: 'ICIC',
          },
          created_at: 1567686387,
          updated_at: 1567686387,
        },
        {
          id: 'down_DEW7D9S10PEsl2',
          entity: 'payment.downtime',
          method: 'netbanking',
          begin: 1567686386,
          end: null,
          status: 'started',
          scheduled: false,
          severity: 'low',
          instrument: {
            bank: 'HDFC',
          },
          created_at: 1567686387,
          updated_at: 1567686387,
        },
      ],
    };
  }

  if (offers) {
    preferences.offers = [
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DeyaOUCgXd49pt',
        name: 'Netbanking_SBI_1',
        payment_method: 'netbanking',
        issuer: 'SBIN',
        display_text: 'Rs. 20 off on SBI Netbanking',
      },
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DeycnL6DJueSQ6',
        name: 'Netbanking_HDFC_1',
        payment_method: 'netbanking',
        issuer: 'HDFC',
        display_text: 'Rs. 20 off on HDF Netbanking',
      },
    ];
  }

  return preferences;
}

module.exports = function(testFeatures) {
  testFeatures = {
    ...defaultOptions,
    ...testFeatures,
  };

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    downtime,
    offers,
  } = testFeatures;

  const options = makeTestOptions(testFeatures);
  const preferences = makeTestPreferences(testFeatures);

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

      if (partialPayment) {
        await handlePartialPayment(context, '100');
      } else {
        await proceed(context);
      }

      await assertUserDetails(context);
      await assertEditUserDetailsAndBack(context);
      await assertPaymentMethods(context);
      await selectPaymentMethod(context, 'netbanking');
      await assertNetbankingPage(context);

      if (downtime) {
        await selectBank(context, 'ICIC');
        await verifyLowDowntime(context, 'ICICI Bank');
        await selectBank(context, 'HDFC');
        await verifyLowDowntime(context, 'HDFC Bank');
      } else {
        await selectBank(context, 'SBIN');
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
          bank: 'SBIN',
        });
      } else {
        await passRequestNetbanking(context);
        await handleMockSuccessDialog(context);
      }
    });
  });
};
