const { openCheckoutWithNewHomeScreen } = require('../open');
const { getTestData } = require('../../../actions');
const {
  selectPersonalizedCard,
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  retryTransaction,
  handleMockSuccessDialog,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData('perform card transaction with personalization', {
    loggedIn: false,
    options: {
      amount: 200,
      personalization: true,
    },
  })
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPersonalizedCard(context);
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await retryTransaction(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
