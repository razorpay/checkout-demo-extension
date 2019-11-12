const { delay, visible } = require('../util');
const { readFileSync } = require('fs');

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
  retryPayzappWalletTransaction,
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
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
  passRequestNetbanking,
  verifyAutoSelectBankTPV,
};

async function verifyAutoSelectBankTPV(context, bank) {
  const autoSelectbank = await context.page.waitForSelector('.bank-name');
  const autoSelectbankName = await context.page.evaluate(
    autoSelectbank => autoSelectbank.textContent,
    autoSelectbank
  );
  expect(autoSelectbankName).toContain(bank);
}

async function selectUPIApp(context, AppNumber) {
  await context.page.click('.option:nth-of-type(' + AppNumber + ')');
}

async function respondAndVerifyIntentRequest(context, offerId) {
  const reqorg = await context.expectRequest();
  expect(reqorg.url).toEqual(
    'https://api.razorpay.com/v1/payments/create/ajax'
  );
  if (offerId != '') expect(reqorg.body).toContain(offerId);
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

async function respondToUPIAjax(context, offerId) {
  const req = await context.expectRequest();
  if (offerId != '') expect(req.body).toContain(offerId);
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'async',
    version: 1,
    payment_id: 'pay_DaaBCIH1rZXZg5',
    gateway:
      'eyJpdiI6IjdzTEZcLzUzUVN5dHBORHlZRFc2TVh3PT0iLCJ2YWx1ZSI6IldXeDdpWVFTSWhLbThLOWtXancrNEhRRkl0ZE5peDNDSDJnMUJTVmg4THc9IiwibWFjIjoiMGVhYjFhMDAyYzczNDlkMTI0OGFiMDRjMGJlZDVjZTA5MjM0YTcyNjI0ODQ1MzExMWViZjVjY2QxMGUwZDZmYiJ9',
    data: null,
    request: {
      url:
        'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'GET',
    },
  });
}

async function respondToUPIPaymentStatus(context) {
  const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
  const req = await context.expectRequest();
  expect(req.url).toContain('status?key_id');
  await context.respondPlain(
    `${req.params.callback}(${JSON.stringify(successResult)})`
  );
  await delay(500);
  expect(await context.page.$('#modal-inner')).toEqual(null);
}

async function handleUPIAccountValidation(context, vpa) {
  const req = await context.expectRequest();
  expect(req.url).toContain('validate/account');
  await context.respondJSON({ vpa: vpa, success: true, customer_name: null });
  await delay(1000);
}

async function selectUPIMethod(context, UPIMethod) {
  const upibutton = await context.page.$x(
    '//*[contains(@class,"ref-text") and text() = "' + UPIMethod + '"]'
  );
  await upibutton[0].click();
}

async function enterUPIAccount(context, UPIAccountId) {
  const vpaField = await context.page.waitForSelector('#vpa');
  await vpaField.type(UPIAccountId);
}

async function verifyEMIPlansWithOffers(context, offerNumber) {
  // await delay(40000);
  for (var i = 1; i <= offerNumber; i++) {
    const currentElement = await context.page.$eval(
      '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
        i +
        ')',
      visible
    );
    expect(currentElement).toEqual(true);
  }
}

async function selectEMIPlanWithOffer(context, offerNumber) {
  await context.page.click(
    '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
      offerNumber +
      ')'
  );
}

async function verifyEMIPlansWithoutOffers(context, offerNumber) {
  for (var i = 1; i <= offerNumber; i++) {
    const currentElement = await context.page.$eval(
      '.emi-plans-list .expandable-card:nth-of-type(' + i + ')',
      visible
    );
    expect(currentElement).toEqual(true);
  }
}

async function selectEMIPlanWithoutOffer(context, offerNumber) {
  await context.page.click(
    '.emi-plans-list .expandable-card:nth-of-type(' + offerNumber + ')'
  );
}

async function viewOffers(context) {
  await context.page.click('.offers-title');
}

async function selectOffer(context, offernumber) {
  await context.page.click('.offer.item:nth-of-type(' + offernumber + ')');
  await context.page.click('button[class = "button apply-offer"]');
}

async function setPreferenceForOffer(preferences) {
  preferences.methods.emi_options.ICIC[0].subvention = 'merchant';
  preferences.methods.emi_options.ICIC[1].subvention = 'merchant';
  preferences.methods.emi_options.ICIC[0].offer_id = 'offer_DWcdgbZjWPlmou';
  preferences.methods.emi_options.ICIC[1].offer_id = 'offer_DWcdgbZjWPlmou';
  return preferences;
}

async function verifyOfferApplied(context) {
  expect(await context.page.$eval('.selected-offer', visible)).toEqual(true);
}

async function verifyDiscountAmountInBanner(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('#amount > .discount');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function verifyDiscountPaybleAmount(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('.pay-btn .discount');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function verifyDiscountText(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('.discount-text');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function enterCardDetails(context, cardType) {
  const cardNum = await context.page.waitForSelector('#card_number');
  if (cardType == undefined) await cardNum.type('5241 9333 8074 0001');
  else if (cardType == 'VISA') await cardNum.type('4111 1111 1111 1111');
  await context.expectRequest(req => {});
  await context.respondJSON({
    recurring: false,
    iframe: true,
    http_status_code: 200,
  });
  await context.page.type('#card_expiry', '12/55');
  await context.page.type('#card_name', 'SakshiJain');
  await context.page.type('#card_cvv', '112');
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
async function verifyPartialAmount(context, amount) {
  const orignalAmount = await context.page.waitForSelector('.original-amount');
  const otpAmount = await context.page.evaluate(
    orignalAmount => orignalAmount.textContent,
    orignalAmount
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  await delay(300);
  const makePartialCheckBox = await context.page.waitForSelector(
    '#partial-radio'
  );
  await makePartialCheckBox.click();
  // await delay(800);
  // await makePartialCheckBox.click();
  // await makePartialCheckBox.click();
  // await delay(800);
  // await makePartialCheckBox.click();
  // await makePartialCheckBox.click();
  const amountValue = await context.page.waitForSelector('#amount-value');
  await amountValue.type(amount);
  await delay(300);
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
  await delay(300);
  context.page.click('#footer');
  await delay(1000);
}

async function handleCardValidation(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'first',
    request: {
      url:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
      method: 'get',
      content: [],
    },
    payment_id: 'pay_DLXKaJEF1T1KxC',
    amount: '\u20b9 51',
    image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
  });
  await delay(1100);
}

async function handleEMIValidation(context) {
  await context.expectRequest();
  await context.respondJSON({
    type: 'first',
    request: {
      url:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
      method: 'get',
      content: [],
    },
    payment_id: 'pay_DLXKaJEF1T1KxC',
    amount: '\u20b9 51',
    image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
  });
  await delay(1000);
}

async function handleCardValidationWithCallback(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/checkout');
  await context.respondPlain(contents);
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
  let passButton = await popupPage.$('.success');
  if (passButton == null) {
    await delay(400);
    passButton = await popupPage.$('.success');
  }
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

async function passRequestNetbanking(context) {
  const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
  const req = await context.expectRequest();
  //expect(req.url).toContain('status?key_id');
  context.respondJSON({
    type: 'first',
    request: {
      url:
        'https://api-web.func.razorpay.in/v1/gateway/mocksharp/payment?key_id=rzp_test_csiPFCSLbrdDCO',
      method: 'post',
      content: {
        action: 'authorize',
        amount: 105,
        method: 'netbanking',
        payment_id: 'DewgcLMrzDlVRg',
        callback_url:
          'https://api-web.func.razorpay.in/v1/payments/pay_DewgcLMrzDlVRg/callback/c736f6c7af6f597606344637cbe802c7ebac24ca/rzp_test_csiPFCSLbrdDCO',
        recurring: 0,
      },
    },
    version: 1,
    payment_id: 'pay_DewgcLMrzDlVRg',
    gateway:
      'eyJpdiI6IjJLaG5PSnF0NUV6TVJRdkRnajc1UFE9PSIsInZhbHVlIjoiczdQZEUrMGN2NFFneTJkQmJuUFwvb3hsUmpxdG1NNTUzaXpRaytpN0J2RDQ9IiwibWFjIjoiMzAzMTU2MmQwNzA0OWU1NjQ2OGI3MjNkOGQyNDAxZTM1MzA0YmFkZDQwNWFlODAyYTg1OGNiZTIwODgwYmI5ZSJ9',
    amount: '\u20b9 1.05',
    image: null,
    magic: false,
  });
  await delay(500);
}

async function retryWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#otp-action');
  await retryButton.click();
}

async function retryPayzappWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#fd-hide');
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
  //   context.testCount++;
  //   console.log(context.testCount);
  //   await context.page.screenshot({
  //     path: '/Users/sakshijain/Desktop/Test_1/'+ context.testCount + '.jpg',
  //     fullpage: true,
  //     type: 'jpeg'
  // });
  await delay(300);
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

async function handleOtpVerification(context, walletissuer) {
  if (walletissuer == undefined) walletissuer = 'freecharge';
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
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
    wallet: walletissuer,
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
  await delay(200);
}
