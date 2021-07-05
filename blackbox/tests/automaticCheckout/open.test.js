const { openAutoCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  handleAutomaticCheckoutButtonClick,
} = require('../../actions/common');

describe('Automatic checkout', () => {
  test('perform automatic checkout render and click', async () => {
    const preferences = makePreferences();
    const context = await openAutoCheckout({ page, preferences });
    await handleAutomaticCheckoutButtonClick(context);
  });
});
