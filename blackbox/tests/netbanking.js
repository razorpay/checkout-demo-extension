const { openCheckout } = require('../checkout');
const { makePreferences } = require('../actions/preferences');
const { delay } = require('../util');
const assert = require('../assert');

module.exports = async function netbanking(page) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: 200,
    personalization: false,
  };

  const preferences = makePreferences();
  const context = await openCheckout({ page, options, preferences });
  await page.type('[name=contact]', '9999988888');
  await page.type('[name=email]', 'pro@rzp.com');
  await page.click('[tab=netbanking]');
  await page.select('#bank-select', 'SBIN');

  await delay(200);
  await page.click('#footer');

  context.popup();

  await context.expectRequest(req => {
    assert.equal(req.method, 'POST');
  });

  await context.respondJSON({ error: { description: 'some error' } });
  await page.close();
};
