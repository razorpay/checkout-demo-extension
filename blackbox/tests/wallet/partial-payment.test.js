const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe('Wallet tests', () => {
  test('Wallet payment with partial payment', async () => {
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
    await delay(200);
    const walletButton = await page.waitForSelector('div[tab="wallet"]');
    await walletButton.click();
    await delay(200);
    const freechargeButton = await page.waitForSelector(
      'label[for="wallet-radio-freecharge"]'
    );
    await freechargeButton.click();
    await delay(200);
    const payButton = await page.waitForSelector('.pay-btn');
    await payButton.click();
    // await handleFeeBearer(context, page);
    let req = await context.expectRequest();
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
    const otpField = await page.waitForSelector('#otp');
    await otpField.type('5555');
    await delay(800);
    const orignalAmount = await page.waitForSelector('.original-amount');
    const otpAmount = await page.evaluate(
      orignalAmount => orignalAmount.textContent,
      orignalAmount
    );
    expect(otpAmount).toEqual('₹ 100');
    const otpButton = await page.waitForSelector('.otp-btn');
    await otpButton.click();
    await context.expectRequest(req => {});
    context.failRequest({ error: 'failed' });
    const retryButton = await page.waitForSelector('#otp-action');
    await retryButton.click();
    await delay(200);
    await payButton.click();
    // await handleFeeBearer(context, page);
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
    await otpField.type('5555');
    await delay(800);
    await otpButton.click();
    await context.respondJSON({ razorpay_payment_id: 'pay_123' });
  });
});
