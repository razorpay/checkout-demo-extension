const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectBank,
  assertNetbankingPage,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
} = require('../../../actions/common');

const {
  assertPaymentMethods,
  selectPaymentMethod,
  assertMissingDetails,
  assertMethodsScreen,
} = require('../actions');

describe.each(
  getTestData('perform netbaking transaction with contact and email optional', {
    options: {
      amount: 200,
      personalization: false,
    },
    preferences: {
      optional: ['contact', 'email'],
    },
  })
)('Netbanking tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertMethodsScreen(context);
    await assertMissingDetails(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
