const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 20,
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
    let req = await context.expectRequest();

    expect(req.method).toEqual('POST');
    context.respondJSON({ error: { description: 'some error' } });
    await delay(15000);
    expect(await page.$('[name=contact]')).not.toEqual(null);
    await delay(5000);
    expect(await page.$('[name=contact]')).toEqual(null);
  });
});
