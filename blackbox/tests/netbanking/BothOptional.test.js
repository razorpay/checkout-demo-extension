const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay, visible } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with contact and email optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckout({ page, options, preferences });
    // await delay(20000);
    expect(await page.$eval('[name=contact]', visible)).toEqual(false);
    expect(await page.$eval('[name=email]', visible)).toEqual(false);
    // await page.type('[name=contact]', '9999988888');
    // await page.type('[name=email]', 'pro@rzp.com');
    await page.click('[tab=netbanking]');
    await page.select('#bank-select', 'SBIN');
    await delay(800);
    await page.click('#footer');
    // context.popup();
    let req = await context.expectRequest();

    expect(req.method).toEqual('POST');
    context.respondJSON({ error: { description: 'some error' } });
  });
});
