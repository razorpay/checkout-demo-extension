const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectBank,
  assertNetbankingPage,
  submit,
  failRequestwithErrorMessage,
  verifyErrorMessage,
  handleFeeBearer,
} = require('../../actions/common');

describe.skip('Netbanking tests', () => {
  test('perform netbanking transaction with fee bearer', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600,
      personalization: false,
    };

    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);

    await handleFeeBearer(context, page);

    await context.popup();

    const expectedErrorMeassage = 'Payment failed';
    await failRequestwithErrorMessage(context, expectedErrorMeassage);
    await verifyErrorMessage(context, expectedErrorMeassage);
  });
});
