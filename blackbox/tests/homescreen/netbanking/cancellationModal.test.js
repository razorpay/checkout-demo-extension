const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  // Generic
  submit,
  passRequestNetbanking,

  // Netbanking
  selectBank,
  assertNetbankingPage,
  popupClosedByUser,
  provideCancellationReason,
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
  getTestData('Verify cancellation modal flow', {
    options: {
      amount: 200,
    },
  })
)('Netbanking', ({ preferences, title, options }) => {
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
