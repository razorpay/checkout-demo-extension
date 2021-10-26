const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  goBackFromTopbar,
  verifyFooterText,
  handleFeeBearer,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
} = require('../actions');

describe.each(
  getTestData('Perform upi recurring collect with fee bearer transaction', {
    options: {
      order_id: 'order_DfNAO0KJCH5WNY',
      personalization: false,
      recurring: 1,
    },
    preferences: {
      fee_bearer: true,
      order: {
        amount: 20000,
        currency: 'INR',
        method: 'upi',
        token: {
          max_amount: 2000,
          frequency: 'weekly',
          recurring_type: 'after',
          start_time: Date.now(),
          end_time: Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
      },
    },
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    /** For fee bearer amount is not shown in cta */
    await verifyFooterText(context, 'PAY');

    //#region This is test CTA is visible on back as well (user will be in details screen).
    await proceed(context);
    await goBackFromTopbar(context);
    await verifyFooterText(context, 'PAY');
    //#endregion

    await proceed(context);
    // await selectUPIPspBank(context);
    // await proceed(context);
    await selectUPIMethod(context, 'new');
    await enterUPIAccount(context, 'saranshgupta1995@okaxis');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await handleFeeBearer(context);
    await respondToUPIAjax(context, { recurring: true });
    await respondToUPIPaymentStatus(context);
  });
});
