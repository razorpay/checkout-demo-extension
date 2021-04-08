const { delay } = require('../util');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const querystring = require('querystring');

async function respondAndVerifyIntentRequest(
  context,
  { isBrowserIntent = false } = {}
) {
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
  if (isBrowserIntent) {
    return;
  }
  const result = await context.getResult();
  expect(result).toMatchObject(successResult);
}

async function verifyErrorMessage(context, expectedErrorMeassage) {
  const messageDiv = await context.page.waitForSelector('#fd-t');
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  for (let retrycount = 0; retrycount < 5; retrycount++) {
    if (messageText.includes('Your payment is being processed')) {
      await context.page.waitFor('#fd-t', {
        timeout: 2000,
        visible: true,
      });
      const messageDiv = await context.page.waitForSelector('#fd-t');
      messageText = await context.page.evaluate(
        messageDiv => messageDiv.textContent,
        messageDiv
      );
    } else if (messageText == expectedErrorMeassage) {
      break;
    }
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
  // needed for wallet screen animation
  await delay(300);
  const clickPromise = context.page.click('#footer');

  if (context.options.redirect) {
    await delay(600);
  } else {
    await clickPromise;
  }
}

async function handleMockFailureDialog(context) {
  let popup = await context.popup();
  await popup.callback({
    error: {
      description: 'The payment has already been processed',
    },
  });
}

async function popupClosedByUser(context) {
  let popup = await context.popup();
  await popup.page.close();
}

async function provideCancellationReason(context, method) {
  await delay(500);
  const reasonOther = await context.page.$(
    '#cancel_' + method + ' input[value=other]'
  );
  await reasonOther.click();
  const submitCancellationReasonButton = await context.page.$(
    '#cancel_netbanking button.btn'
  );
  await submitCancellationReasonButton.click();
  await respondToCancellationRequest(context);
}

async function respondToCancellationRequest(context) {
  const reqorg = await context.expectRequest();
  expect(reqorg.url).toContain('/cancel');
  expect(reqorg.method).toEqual('GET');
  await context.respondJSON({
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment processing cancelled by user',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'payment_cancelled',
      metadata: { payment_id: 'pay_FdfZ3QnaBCid1G' },
    },
  });
}

async function handleMockSuccessDialog(context) {
  let popup = await context.popup();
  await popup.callback({ razorpay_payment_id: 'pay_123465' });
}

async function expectRedirectWithCallback(context, fields) {
  const request = await context.expectRequest();
  const body = querystring.parse(request.body);
  if (fields.method === 'upi_otm') {
    fields.method = 'upi';
  }
  const apiUrl = 'https://api.razorpay.com/v1/payments/create/';
  expect(request.method).toEqual('POST');
  if (fields) {
    expect(body).toMatchObject(fields);
  }
  let apiSuffix = '';
  if (context.preferences.fees) {
    apiSuffix = 'fees';
  } else if (
    context.preferences.methods.upi ||
    context.preferences.methods.upi_otm ||
    fields.method == 'paylater' ||
    (context.preferences.methods.cardless_emi != undefined &&
      !context.prefilledContact &&
      !context.isContactOptional) ||
    (fields.method == 'wallet' &&
      !context.prefilledContact &&
      !context.isContactOptional &&
      !context.preferences.offers)
  ) {
    if (fields.method === 'wallet') {
      const powerWallets = ['mobikwik', 'freecharge', 'payumoney'];
      const isPowerWallet = powerWallets.includes(fields.wallet);

      if (isPowerWallet) {
        apiSuffix = 'ajax';
      } else {
        apiSuffix = 'checkout';
      }
    } else {
      apiSuffix = 'ajax';
    }
  } else if (
    context.preferences.methods.cardless_emi != undefined &&
    context.preferences.customer != undefined
  ) {
    apiSuffix = 'ajax';
  } else {
    apiSuffix = 'checkout';
  }
  expect(request.url).toEqual(apiUrl + apiSuffix);

  expect(body.callback_url).toEqual(context.options.callback_url);
  await context.respondPlain('');
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

async function handleAJAXRequest(context, method = 'card') {
  await context.expectRequest();
  await context.respondJSON(mockAPI.ajaxResponse(method));
}

async function selectBank(context, bank) {
  // Open search modal
  await context.page.click('#bank-select');

  // Wait for modal to open
  await context.page.waitForSelector('.search-field input');

  // Type bank code
  await context.page.type('.search-field input', bank);

  // Wait for top result
  await context.page.waitForSelector(
    '.search-box .list .list-item:first-child',
    {
      timeout: 300,
    }
  );

  // Select top result
  await context.page.click('.search-box .list .list-item:first-child');

  // Wait for modal to be hidden
  await context.page.waitForSelector('.search-field input', {
    hidden: true,
  });
}

async function retryTransaction(context) {
  await context.page.waitFor('#fd-hide', {
    timeout: 2000,
    visible: true,
  });
  const retryButton = await context.page.waitForSelector('#fd-hide');
  await retryButton.click();
}


module.exports = {
  handleMockFailureDialog,
  handleMockSuccessDialog,
  handleValidationRequest,
  failRequestwithErrorMessage,
  selectBank,
  expectRedirectWithCallback,
  validateHelpMessage,
  verifyErrorMessage,
  submit,
  respondAndVerifyIntentRequest,
  retryTransaction,
  popupClosedByUser,
  provideCancellationReason,
  handleAJAXRequest,
};
