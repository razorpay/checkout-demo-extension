const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData('Perform Bank Transfer transaction with contact optional', {
    options: {
      order_id: 'order_DhheFqhhT2RMur',
      amount: 200000,
      personalization: false,
    },
    preferences: {
      optional: ['contact'],
    },
  })
)('Bank Transfer tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.bank_transfer = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'bank_transfer');
    await returnVirtualAccounts(context);
    await verifyNeftDetails(context);
    await verifyRoundOffAlertMessage(context);
  });
});
