const { makePreferences } = require('../../../actions/preferences');
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

describe('Netbanking tests', () => {
  test('perform netbaking transaction with contact and email optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
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
