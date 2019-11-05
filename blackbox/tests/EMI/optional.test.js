const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  enterCardDetails,
  submit,
  selectEMIPlanWithoutOffer,
  verifyEMIPlansWithoutOffers,
  handleEMIValidation,
  handleMockSuccessDialog,
} = require('../../actions/common');

describe('EMI tests', () => {
  test('perform EMI transaction with contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await submit(context);
    await verifyEMIPlansWithoutOffers(context, '6');
    await selectEMIPlanWithoutOffer(context, '2');
    await submit(context);
    await handleEMIValidation(context);
    await handleMockSuccessDialog(context);
  });
});
