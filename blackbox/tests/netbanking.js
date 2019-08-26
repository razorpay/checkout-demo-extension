const { openCheckout } = require('../checkout');
const { makePreferences } = require('../actions/preferences');
const assert = require('../assert');

module.exports = async function card(page) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: 200,
  };

  const preferences = makePreferences();
  await openCheckout({ page, options, preferences });
  await page.close();
};
