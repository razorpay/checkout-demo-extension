const { delay, visible } = require('../util');

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
};

async function verifyErrorMessage(context, expectedErrorMeassage) {
  const messageDiv = await context.page.waitForSelector('#fd-t');
  const messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  expect(messageText).toEqual(expectedErrorMeassage);
}
async function verifyPartialAmount(context, amount) {
  const orignalAmount = await context.page.waitForSelector('.original-amount');
  const otpAmount = await context.page.evaluate(
    orignalAmount => orignalAmount.textContent,
    orignalAmount
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  const makePartialCheckBox = await context.page.waitForSelector('.checkbox');
  await makePartialCheckBox.click();
  const amountValue = await context.page.waitForSelector('#amount-value');
  await amountValue.type(amount);
  const nextButton = await context.page.waitForSelector('#next-button');
  await nextButton.click();
  await delay(200);
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
  await delay(200);
  await context.page.click('#footer');
}

async function handleValidationRequest(context, passOrFail) {
  await context.expectRequest(req => {});
  if (passOrFail == 'fail') {
    await context.failRequest({ error: 'failed' });
  } else if (passOrFail == 'pass') {
    await context.respondJSON({ razorpay_payment_id: 'pay_123' });
  }
}

async function failRequestwithErrorMessage(context, errorMessage) {
  await context.expectRequest(req => {});
  await context.failRequest({ error: errorMessage });
}

async function retryWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#otp-action');
  await retryButton.click();
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

async function assertNetbankingPage(context) {
  expect(
    await context.page.$eval('label[for=bank-radio-SBIN]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-HDFC]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-ICIC]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-UTIB]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-KKBK]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-YESB]', visible)
  ).toEqual(true);
}

async function assertHomePage(context, contactExists, emailExists) {
  expect(await context.page.$eval('[name=contact]', visible)).toEqual(
    contactExists
  );
  expect(await context.page.$eval('[name=email]', visible)).toEqual(
    emailExists
  );
}

async function fillUserDetails(context, isContactRequired) {
  if (isContactRequired)
    await context.page.type('[name=contact]', '9999988888');
  await context.page.type('[name=email]', 'pro@rzp.com');
}

async function assertPaymentMethods(context) {
  expect(await context.page.$eval('[tab=netbanking]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=wallet]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=card]', visible)).toEqual(true);
}

async function selectPaymentMethod(context, method) {
  await context.page.click('[tab=' + method + ']');
}

async function selectWallet(context, walletName) {
  await context.page.click('label[for=wallet-radio-' + walletName + ']');
}

async function selectBank(context, bank) {
  await context.page.select('#bank-select', bank);
}

async function typeOTPandSubmit(context) {
  await typeOTP(context);
  await delay(1200);
  await context.page.click('.otp-btn');
}
async function typeOTP(context) {
  await delay(800);
  await context.page.type('#otp', '5555');
}

async function verifyTimeout(context, paymentMode) {
  if (paymentMode == 'netbanking') {
    await delay(5000);
    expect(await context.page.$('#fd-hide')).not.toEqual(null);
    await delay(5000);
    expect(await context.page.$('#fd-hide')).toEqual(null);
  } else if (paymentMode == 'wallet') {
    await delay(5000);
    expect(await context.page.$('.otp-btn')).not.toEqual(null);
    await delay(7000);
    expect(await context.page.$('.otp-btn')).toEqual(null);
  }
}

async function handleOtpVerification(context) {
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
}
async function handleFeeBearer(context) {
  let req = await context.expectRequest();
  expect(req.method).toEqual('POST');
  await context.respondJSON({
    input: {
      contact: '9999988888',
      email: 'pro@rzp.com',
      amount: 62054,
      method: 'netbanking',
      bank: 'IDFB',
      currency: 'INR',
      _: {
        shield: {
          fhash: 'b8d153db696c383755848673264644e61927c1d3',
          tz: '330',
        },
        checkout_id: 'DLwoGw9hp2q2L1',
        referer: 'https://api.razorpay.com/test/layout.php',
        library: 'checkoutjs',
        platform: 'browser',
      },
      fee: 2054,
    },
    display: {
      originalAmount: 600,
      original_amount: 600,
      fees: 20.54,
      razorpay_fee: 17.4,
      tax: 3.14,
      amount: 620.54,
    },
  });
  const feeAmount11 = await context.page.$$('.fee-amount');
  feeAmount = feeAmount11[0];
  expectedfeeAmount1 = '₹ 600';
  const feeAmount1 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount1).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[1];
  expectedfeeAmount1 = '₹ 17.40';
  const feeAmount2 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount2).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[2];
  expectedfeeAmount1 = '₹ 3.14';
  const feeAmount3 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount3).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[3];
  expectedfeeAmount1 = '₹ 620.54';
  const feeAmount4 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount4).toEqual(expectedfeeAmount1);
  const continueButton = await context.page.$x(
    '//*[@class="btn" and text() = "Continue"]'
  );
  await continueButton[0].click();
  // await delay(200);
}
