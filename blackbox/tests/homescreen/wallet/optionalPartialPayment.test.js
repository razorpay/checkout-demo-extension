const { makePreferences } = require('../../../actions/preferences');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  verifyPartialAmount,
  handleWalletPopUp,
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

describe('Wallet tests', () => {
  test('Wallet keyless payment with partial payment and contact optional', async () => {
    const options = {
      key: 'rzp_test_o39NWyo4QjBTFF',
      amount: 200000,
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
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'payzapp');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleWalletPopUp(context);
  });
});
