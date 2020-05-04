const { openCheckoutWithNewHomeScreen } = require('../open');
const { delay } = require('../../../util');
const { makePreferences } = require('../../../actions/preferences');

const { proceed, fillUserDetails, selectPaymentMethod } = require('../actions');

const {
  selectLocale,
  verifyLabel,
  respondToBundleRequest,
} = require('../../../actions/i18n');

describe('I18n tests', () => {
  test('Verify labels for netbanking', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 10000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: {
        vernacular: true,
      },
    });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await fillUserDetails(context);
    await proceed(context);
    await selectPaymentMethod(context, 'netbanking');
    await selectLocale(context, 'hi');
    await verifyLabel(
      context,
      '#nb-elem select option[value=""]',
      'en',
      'netbanking.select_label'
    );
    await respondToBundleRequest(context, 'hi');
    await verifyLabel(
      context,
      '#nb-elem select option[value=""]',
      'hi',
      'netbanking.select_label'
    );
  });
});
