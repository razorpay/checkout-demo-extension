const { openCheckout } = require('../checkout');
const { makePreferences } = require('../actions/preferences');
const { delay } = require('../util');
const assert = require('../assert');

describe('Netbanking tests', () => {
  test('perform netbaking transaction', async page => {
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

    await delay(2000);
    await page.click('#footer');

    // context.popup();

    context.expectRequest(req => {
      assert.equal(req.method, 'GET');
    });

    context.respondJSON({ error: { description: 'some error' } });
    await page.close();
  });
});
