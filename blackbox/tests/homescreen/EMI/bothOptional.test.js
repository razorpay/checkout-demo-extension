const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectEMIPlanWithoutOffer,
  verifyEMIPlansWithoutOffers,
  handleEMIValidation,
  handleMockSuccessDialog,
  enterCardDetails,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  assertPaymentMethods,
  selectPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Perform EMI transaction with contact and email optional', {
    options: {
      amount: 500000,
      personalization: false,
    },
    preferences: {
      optional: ['contact', 'email'],
    },
  })
)('EMI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
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
