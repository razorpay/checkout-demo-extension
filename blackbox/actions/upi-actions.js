const { delay, randomContact } = require('../util');

async function selectUPIApp(context, AppNumber) {
  await context.page.click('.option:nth-of-type(' + AppNumber + ')');
}

async function respondToUPIAjax(context, { method } = {}, offerId = '') {
  var dataValue,
    typeValue = {};
  const req = await context.expectRequest();
  if (offerId != '') expect(req.body).toContain(offerId);
  expect(req.url).toContain('create/ajax');
  if (method === 'qr') {
    typeValue = 'intent';
    dataValue = {
      intent_url:
        'upi://pay?pa=upi@razopay&pn=Razorpay&tr=1UIWQ1mLDGYBQbR&tn=razorpay&am=10.24&cu=INR&mc=5411',
    };
  } else {
    typeValue = 'async';
    dataValue = null;
  }

  await context.respondJSON({
    type: typeValue,
    version: 1,
    payment_id: 'pay_DaaBCIH1rZXZg5',
    gateway:
      'eyJpdiI6IlFOYUo1WEY1WWJmY1FHWURKdmpLeUE9PSIsInZhbHVlIjoiQlhXRTFNcXZKblhxSzJRYTBWK1pMc2VLM0owWUpLRk9JWTZXT04rZlJYRT0iLCJtYWMiOiIxZjk5Yjc5ZmRlZDFlNThmNWQ5ZTc3ZDdiMTMzYzU0ZmRiOTIxY2NlM2IxYjZlNjk5NDEzMGUzMzEzOTA1ZGEwIn0',
    data: dataValue,
    request: {
      url:
        'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'GET',
    },
  });
}
async function handleSaveVpaRequest(context, { method } = {}, offerId = '') {
  let typeValue = 'async';
  let dataValue = null;

  const req = await context.expectRequest();
  if (offerId != '') expect(req.body).toContain(offerId);
  if (context.preferences.customer) expect(req.body).toContain('save=1');
  expect(req.url).toContain('create/ajax');

  await context.respondJSON({
    type: typeValue,
    version: 1,
    payment_id: 'pay_DaaBCIH1rZXZg5',
    gateway:
      'eyJpdiI6IlFOYUo1WEY1WWJmY1FHWURKdmpLeUE9PSIsInZhbHVlIjoiQlhXRTFNcXZKblhxSzJRYTBWK1pMc2VLM0owWUpLRk9JWTZXT04rZlJYRT0iLCJtYWMiOiIxZjk5Yjc5ZmRlZDFlNThmNWQ5ZTc3ZDdiMTMzYzU0ZmRiOTIxY2NlM2IxYjZlNjk5NDEzMGUzMzEzOTA1ZGEwIn0',
    data: dataValue,
    request: {
      url:
        'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'GET',
    },
  });
}

async function respondToUPIAjaxWithFailure(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'User not found with the given input',
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
  await context.page.waitFor('#modal-inner', {
    timeout: 2000,
    hidden: true,
  });
  expect(await context.page.$('#modal-inner')).toEqual(null);
}

async function handleUPIAccountValidation(context, vpa, accountexists = true) {
  const req = await context.expectRequest();
  if (
    accountexists &&
    context.preferences.features != null &&
    context.preferences.features.google_pay_omnichannel == true
  )
    expect(req.url).toContain('create/ajax');
  else expect(req.url).toContain('validate/account');
  await context.respondJSON({ vpa: vpa, success: true, customer_name: null });
}

async function handleSavedTokenValidation(context, vpa) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({ vpa: vpa, success: true, customer_name: null });
}

async function selectUPIMethod(context, UPIMethod) {
  let tokenSelector = null;
  let elementToBeVisible = null;

  switch (UPIMethod) {
    case 'omnichannel':
      tokenSelector = 'gpay-omnichannel';
      elementToBeVisible = 'gpay-phone';
      break;
    case 'new':
      tokenSelector = 'new-vpa-field';
      elementToBeVisible = 'new-vpa-input';
      break;
    case 'token':
      tokenSelector = 'upi-svelte-wrap .slotted-radio';
      elementToBeVisible = 'footer';
      break;
    default:
      break;
  }
  let selectedUPI = await context.page.waitForSelector('#' + tokenSelector);
  await selectedUPI.click();
  return await context.page.waitForSelector('#' + elementToBeVisible, {
    visible: true,
  });
}

async function enterUPIAccount(context, UPIAccountId) {
  const vpaField = await context.page.waitForSelector('#new-vpa-input');
  await vpaField.type(UPIAccountId);
  if (!context.preferences.customer) return;
  return await context.page.waitForSelector('#should-save-vpa');
}

async function selectBankNameFromGooglePayDropDown(context, valuetoBeSelected) {
  await context.page.select('select[name="gpay_bank"]', valuetoBeSelected);
}

async function verifyOmnichannelPhoneNumber(context) {
  expect(await context.page.$('#gpay-phone')).not.toEqual(null);
}

async function enterOmnichannelPhoneNumber(context) {
  const phoneField = await context.page.waitForSelector('#gpay-phone');
  await phoneField.type(randomContact());
}

module.exports = {
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectBankNameFromGooglePayDropDown,
  selectUPIApp,
  verifyOmnichannelPhoneNumber,
  enterOmnichannelPhoneNumber,
  respondToUPIAjaxWithFailure,
  handleSaveVpaRequest,
  handleSavedTokenValidation,
};
