async function verifyPayLaterPaymentMode(context) {
  const messageDiv = await context.page.waitForXPath(
    '//div[@data-paylater="epaylater"]'
  );
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  messageText = messageText.trim();
  expect(messageText).toEqual('ePayLater');
}

async function selectPayLaterPaymentMode(context) {
  const paylater = await context.page.waitForXPath(
    '//div[@data-paylater="epaylater"]'
  );
  await paylater.click();
}

async function verifyPayLaterOTP(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('otp/verify');
  await context.respondJSON({
    ott: '3007d85081c8fb',
    success: 1,
  });
}
async function respondToPayLater(context) {
  await context.respondJSON({ razorpay_payment_id: 'pay_123' });
}

async function passRequestPayLater(context) {
  context.respondJSON({
    method: 'paylater',
    missing: ['contact'],
    provider: 'epaylater',
    request: {
      url:
        'https://api.razorpay.com/v1/payments?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'post',
      content: {
        amount: 600000,
        method: 'paylater',
        provider: 'epaylater',
        currency: 'INR',
      },
    },
    type: 'respawn',
    version: 1,
  });
}

module.exports = {
  verifyPayLaterPaymentMode,
  selectPayLaterPaymentMode,
  verifyPayLaterOTP,
  respondToPayLater,
  passRequestPayLater,
};
