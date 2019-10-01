const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe('Wallet tests', () => {
  test('perform wallet transaction with timeout enabled', async () => {
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
    const cardButton = await page.waitForSelector('div[tab="wallet"');
    await cardButton.click();
    await delay(1500);
    const freechargeButton = await page.waitForSelector(
      'label[for="wallet-radio-freecharge"]'
    );
    await freechargeButton.click();
    await delay(1500);
    const payButton = await page.waitForSelector('.pay-btn');
    await payButton.click();
    let req = await context.expectRequest();
    await context.respondJSON({
      type: 'otp',
      request: {
        url:
          'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
        method: 'post',
        content: { next: ['resend_otp'] },
      },
      version: 1,
      payment_id: 'pay_DLbzHmbxvcpY9o',
      gateway:
        'eyJpdiI6IlNVeTJxS3U4YmRNeU1KblFEY3Z4VFE9PSIsInZhbHVlIjoiZUJWMEJ3OHExaDFNY2xnWjFCbGpQQzN1OENlTXlOOW9iY1IwQSs2WE9aMD0iLCJtYWMiOiIyYWMxNjY5ZGViYTE2NTBlNTkyOTUwYjhhMDcwYzZlOTY3MzE1OTBkZDVkZjk2MDc3NTdlNDE2NmE3MzIzYjM0In0=',
      contact: '+919999999999',
      amount: '51.00',
      formatted_amount: '\u20b9 51',
      wallet: 'freecharge',
      merchant: 'RBL Bank',
    });
    await delay(1500);
    const otpField = await page.waitForSelector('#otp');
    await otpField.type('5555');

    const otpButton = await page.waitForSelector('.otp-btn');
    await otpButton.click();
    await context.expectRequest(req => {});
    context.failRequest({ error: 'failed' });
    const retryButton = await page.waitForSelector('#otp-action');
    await retryButton.click();
    await delay(1500);
    await payButton.click();
    await context.expectRequest(req => {});
    await context.respondJSON({
      type: 'otp',
      request: {
        url:
          'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
        method: 'post',
        content: { next: ['resend_otp'] },
      },
      version: 1,
      payment_id: 'pay_DLbzHmbxvcpY9o',
      gateway:
        'eyJpdiI6IlNVeTJxS3U4YmRNeU1KblFEY3Z4VFE9PSIsInZhbHVlIjoiZUJWMEJ3OHExaDFNY2xnWjFCbGpQQzN1OENlTXlOOW9iY1IwQSs2WE9aMD0iLCJtYWMiOiIyYWMxNjY5ZGViYTE2NTBlNTkyOTUwYjhhMDcwYzZlOTY3MzE1OTBkZDVkZjk2MDc3NTdlNDE2NmE3MzIzYjM0In0=',
      contact: '+919999999999',
      amount: '51.00',
      formatted_amount: '\u20b9 51',
      wallet: 'freecharge',
      merchant: 'RBL Bank',
    });
    await delay(1500);
    await otpField.type('5555');
    await delay(1000);
    expect(await page.$('[name=contact]')).not.toEqual(null);
    await delay(13000);
    expect(await page.$('[name=contact]')).toEqual(null);
  });
});
