const { makePreferences } = require('../../../actions/preferences');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  assertNetbankingPage,
  selectBank,
  submit,
  verifyPartialAmount,
  passRequestNetbanking,
  handleMockSuccessDialog,
} = require('../../../actions/common');

const {
  handlePartialPayment,
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with partial payment and contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
