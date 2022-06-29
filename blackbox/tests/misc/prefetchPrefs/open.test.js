const { makePreferences } = require('../../../actions/preferences');
const { prefetchPrefsAndOpenCheckout } = require('../../../actions/checkout');
const {
  handlePrefetchPrefsOpenButtonClick,
} = require('../../../actions/prefetch-prefs');

describe('Prefetch prefs and open', () => {
  test('prefetch preferences and render', async () => {
    const preferences = makePreferences();
    const context = await prefetchPrefsAndOpenCheckout({ page, preferences });
    await handlePrefetchPrefsOpenButtonClick(context);
  });
});
