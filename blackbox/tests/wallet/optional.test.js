const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');

describe('Basic wallet payment', () => {
  test('Perform wallet transaction with contact as optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');

    await page.click('div[tab=wallet');

    await page.click('label[for=wallet-radio-freecharge]');

    await delay(200);
    await page.click('.pay-btn');

    await context.expectRequest();
    await context.respondJSON({
      type: 'otp',
      request: {
        url:
          'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
        method: 'post',
        content: { next: ['resend_otp'] },
      },
      payment_id: 'pay_DLbzHmbxvcpY9o',
      contact: '+919999999999',
      amount: '51.00',
      formatted_amount: '\u20b9 51',
      wallet: 'freecharge',
      merchant: 'RBL Bank',
    });

    await delay(800);
    await page.type('#otp', '5555');
    await delay(1200);
    await page.click('.otp-btn');

    await context.expectRequest(req => {});
    await context.failRequest({ error: 'failed' });

    const retryButton = await page.waitForSelector('#otp-action');
    await retryButton.click();
    await delay(200);
    await page.click('.otp-btn');
    await context.expectRequest(req => {});
    await context.respondJSON({
      type: 'otp',
      request: {
        url:
          'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
        method: 'post',
        content: { next: ['resend_otp'] },
      },
      payment_id: 'pay_DLbzHmbxvcpY9o',
      contact: '+919999999999',
      amount: '51.00',
      formatted_amount: '\u20b9 51',
      wallet: 'freecharge',
      merchant: 'RBL Bank',
    });
    await delay(800);
    await page.type('#otp', '5555');
    await delay(200);
    await page.click('.otp-btn');
    await context.respondJSON({ razorpay_payment_id: 'pay_123' });
  });
});
