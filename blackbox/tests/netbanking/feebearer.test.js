const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbanking transaction with fee bearer', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600,
      personalization: false,
    };

    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');
    await page.click('[tab=netbanking]');
    await page.select('#bank-select', 'SBIN');

    await delay(200);
    await page.click('#footer');

    await handleFeeBearer(context, page);

    context.popup();

    let req = await context.expectRequest();
    expect(req.method).toEqual('POST');

    const expectedErrorMeassage = 'some error';
    await context.respondJSON({
      error: { description: expectedErrorMeassage },
    });
    const messageDiv = await page.waitForSelector('#fd-t');
    const messageText = await page.evaluate(
      messageDiv => messageDiv.textContent,
      messageDiv
    );
    expect(messageText).toEqual(expectedErrorMeassage);
  });
});
