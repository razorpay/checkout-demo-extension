const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const { delay, innerText } = require('../../../util');

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
  popupClosedByUser,
  provideCancellationReason,

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
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  selectPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Verify UPI downtime - High with personalization enabled', {
    options: {
      amount: 200,
    },
  })
)('Netbanking Cancellation modal test', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);

    await selectBank(context, 'SBIN');
    await submit(context);

    await passRequestNetbanking(context);
    await popupClosedByUser(context);
    await provideCancellationReason(context, 'netbanking');
  });
});
