const { openCheckout } = require('../checkout');
const { makePreferences } = require('../actions/preferences');
const { delay } = require('../util');
const assert = require('../assert');
const { handleFeeBearer } = require('../actions/common');

describe('Netbanking tests', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser();
    await jestPuppeteer.resetPage();
  });

  test('perform netbaking transaction', async () => {
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
    let req = await context.expectRequest();

    expect(req.method).toEqual('POST');
    context.respondJSON({ error: { description: 'some error' } });
  });

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
  test('perform netbanking transaction with partial payments', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');

    const makePartialCheckBox = await page.waitForSelector('.checkbox');
    await makePartialCheckBox.click();
    const amountValue = await page.waitForSelector('#amount-value');
    await amountValue.type('100');
    const nextButton = await page.waitForSelector('#next-button');
    await nextButton.click();
    await delay(500);

    await page.click('[tab=netbanking]');
    await page.select('#bank-select', 'SBIN');
    const orignalAmount = await page.waitForSelector('.original-amount');
    const otpAmount = await page.evaluate(
      orignalAmount => orignalAmount.textContent,
      orignalAmount
    );
    expect(otpAmount).toEqual('₹ 100');

    await delay(200);
    await page.click('#footer');

    // await handleFeeBearer(context, page);

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
