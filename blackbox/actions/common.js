const { delay, visible } = require('../util');
const { readFileSync } = require('fs');
// remove destructuring and spread out imported object in modular export
const {
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation,
} = require('./emi-actions');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
} = require('./home-page-actions');
const { assertNetbankingPage } = require('./netbanking-actions');
const {
  verifyPartialAmount,
  handlePartialPayment,
} = require('./partial-payment-actions');
const {
  typeOTP,
  typeOTPandSubmit,
  handleOtpVerification,
} = require('./otp-actions');
const { handleFeeBearer } = require('./feebearer-actions');
const {
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectUPIApp,
} = require('./upi-actions');
const {
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
} = require('./offers-actions');
const {
  enterCardDetails,
  handleCardValidation,
  handleCardValidationWithCallback,
} = require('./card-actions');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

module.exports = {
  handleFeeBearer,
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectWallet,
  selectBank,
  assertWalletPage,
  assertNetbankingPage,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  retryWalletTransaction,
  typeOTP,
  verifyTimeout,
  validateHelpMessage,
  handlePartialPayment,
  verifyPartialAmount,
  verifyErrorMessage,
  failRequestwithErrorMessage,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  retryCardTransaction,
  handleCardValidationWithCallback,
  verifyHighDowntime,
  verifyLowDowntime,
  expectMockSuccessWithCallback,
  expectMockFailureWithCallback,
  handleMockSuccessDialog,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  respondAndVerifyIntentRequest,
  selectUPIApp,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  respondAndVerifyIntentRequest,
  selectUPIApp,
};

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
  const req = await context.expectRequest();
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

async function retryWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#otp-action');
  await retryButton.click();
}

async function retryCardTransaction(context) {
  const retryButton = await context.page.waitForSelector('#fd-hide');
  await retryButton.click();
  await delay(500);
}

async function assertWalletPage(context) {
  expect(
    await context.page.$eval('label[for=wallet-radio-freecharge]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-olamoney]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-payzapp]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-mobikwik]', visible)
  ).toEqual(true);
}

async function selectWallet(context, walletName) {
  await context.page.click('label[for=wallet-radio-' + walletName + ']');
}

async function selectBank(context, bank) {
  await context.page.select('#bank-select', bank);
}

async function verifyHighDowntime(context, message) {
  const toolTip = await context.page.waitForSelector('.downtime .tooltip');
  const toolTipText = await context.page.evaluate(
    toolTip => toolTip.textContent,
    toolTip
  );
  expect(toolTipText).toContain(message);
}

async function verifyLowDowntime(context, message) {
  const warningDiv = await context.page.waitForSelector('.downtime-callout');
  // console.log(warningDiv);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(message);
}

async function verifyTimeout(context, paymentMode) {
  if (
    paymentMode == 'netbanking' ||
    paymentMode == 'card' ||
    paymentMode == 'upi' ||
    paymentMode == 'emi'
  ) {
    await delay(1000);
    expect(await context.page.$('#fd-hide')).not.toEqual(null);
    await delay(10000);
    expect(await context.page.$('#fd-hide')).toEqual(null);
  } else if (paymentMode == 'wallet') {
    await delay(5000);
    expect(await context.page.$('.otp-btn')).not.toEqual(null);
    await delay(7000);
    expect(await context.page.$('.otp-btn')).toEqual(null);
  }
}
