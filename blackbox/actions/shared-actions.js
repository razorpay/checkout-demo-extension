const { delay } = require('../util');

async function respondAndVerifyIntentRequest(context) {
  const reqorg = await context.expectRequest();
  expect(reqorg.url).toEqual(
    'https://api.razorpay.com/v1/payments/create/ajax'
  );
  expect(reqorg.method).toEqual('POST');
  await context.respondJSON({
    data: {
      intent_url:
        'upi://pay?pa=upi@razopay&pn=RBLBank&tr=4kHrR0CI9jEazLO&tn=razorpay&am=1&cu=INR&mc=5411',
    },
    payment_id: 'pay_DaFKujjV6Ajr7W',
    request: {
      method: 'GET',
      url:
        'https://api.razorpay.com/v1/payments/pay_DaFKujjV6Ajr7W/status?key_id=rzp_test_1DP5mmOlF5G5ag',
    },
    type: 'intent',
  });
  await delay(100);
  await page.evaluate(() => upiIntentResponse({ response: { txnId: '123' } }));
  await delay(100);

  const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
  const req = await context.expectRequest();
  expect(req.url).toContain('status?key_id');
  await context.respondPlain(
    `${req.params.callback}(${JSON.stringify(successResult)})`
  );
  const result = await context.getResult();
  expect(result).toMatchObject(successResult);
}

async function verifyErrorMessage(context, expectedErrorMeassage) {
  await delay(800);
  const messageDiv = await context.page.waitForSelector('#fd-t');
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  for (let retrycount = 0; retrycount < 5; retrycount++) {
    if (messageText.includes('Your payment is being processed')) {
      await delay(800);
      const messageDiv = await context.page.waitForSelector('#fd-t');
      messageText = await context.page.evaluate(
        messageDiv => messageDiv.textContent,
        messageDiv
      );
    } else if (messageText == expectedErrorMeassage) break;
  }
  expect(messageText).toEqual(expectedErrorMeassage);
}

async function validateHelpMessage(context, message) {
  const helpElement = await context.page.$('.help');
  const text = await context.page.evaluate(
    helpElement => helpElement.textContent,
    helpElement
  );
  expect(text).toEqual(message);
}

async function submit(context) {
  await delay(300);
  context.page.click('#footer');
  await delay(1000);
}

async function handleMockFailureDialog(context) {
  let popup = await context.popup();
  let popupPage = await popup.page();
  for (let retrycount = 0; retrycount < 7; retrycount++) {
    if (popup == null || popupPage == null) {
      await delay(400);
      popup = await context.popup();
      popupPage = await popup.page();
    } else break;
  }
  const failButton = await popupPage.$('.danger');
  await failButton.click();
  await delay(800);
}

async function handleMockSuccessDialog(context) {
  await delay(300);
  let popup = await context.popup();
  let popupPage = await popup.page();
  if (popup == null || popupPage == null) {
    await delay(400);
    popup = await context.popup();
    popupPage = await popup.page();
  }
  const passButton = await popupPage.$('.success');
  await passButton.click();
  await delay(800);
}

async function expectMockFailureWithCallback(context) {
  await context.page.waitForNavigation();
  const failButton = await context.page.$('.danger');
  await failButton.click();
  const req = await context.expectRequest();
  expect(req.body).toContain('Payment+failed');
  expect(req.body).not.toEqual('razorpay_payment_id=pay_123465');
  await context.respondPlain('11');
}

async function expectMockSuccessWithCallback(context) {
  await context.page.waitForNavigation();
  const passButton = await context.page.$('.success');
  await passButton.click();
  const req = await context.expectRequest();
  expect(req.body).toEqual('razorpay_payment_id=pay_123465');
  await context.respondPlain('11');
}

async function handleValidationRequest(context, passOrFail) {
  await context.expectRequest();
  if (passOrFail == 'fail') {
    await context.failRequest({ error: 'failed' });
  } else if (passOrFail == 'pass') {
    await context.respondJSON({ razorpay_payment_id: 'pay_123' });
  }
}

async function failRequestwithErrorMessage(context, errorMessage) {
  await context.expectRequest();
  await context.failRequest({ error: errorMessage });
}

async function selectBank(context, bank) {
  await context.page.select('#bank-select', bank);
}

async function responseVerificationForUPICollect(context) {
  const reqorg = await context.expectRequest();
  expect(reqorg.url).toEqual(
    'https://api.razorpay.com/v1/payments/create/ajax'
  );
  expect(reqorg.method).toEqual('POST');
  await context.respondJSON({
    data: null,
    payment_id: 'pay_DaFKujjV6Ajr7W',
    request: {
      method: 'GET',
      url:
        'https://api.razorpay.com/v1/payments/pay_DaFKujjV6Ajr7W/status?key_id=rzp_test_1DP5mmOlF5G5ag',
    },
    type: 'async',
  });

  const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
  const req = await context.expectRequest();
  expect(req.url).toContain('status?key_id');
  await context.respondPlain(
    `${req.params.callback}(${JSON.stringify(successResult)})`
  );
  const result = await context.getResult();
  expect(result).toMatchObject(successResult);
}

module.exports = {
  handleMockFailureDialog,
  handleMockSuccessDialog,
  handleValidationRequest,
  failRequestwithErrorMessage,
  selectBank,
  expectMockFailureWithCallback,
  expectMockSuccessWithCallback,
  validateHelpMessage,
  verifyErrorMessage,
  submit,
  respondAndVerifyIntentRequest,
  responseVerificationForUPICollect,
};
