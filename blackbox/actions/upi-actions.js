const { delay, visible } = require('../util');

async function selectUPIApp(context, AppNumber) {
  await context.page.click('.option:nth-of-type(' + AppNumber + ')');
}

async function respondToUPIAjax(context, offerId = '', { method } = {}) {
  const req = await context.expectRequest();
  if (offerId != '') expect(req.body).toContain(offerId);
  expect(req.url).toContain('create/ajax');
  if (method === 'intent') {
    await context.respondJSON({
      type: 'intent',
      version: 1,
      payment_id: 'pay_DaaBCIH1rZXZg5',
      gateway:
        'eyJpdiI6IlFOYUo1WEY1WWJmY1FHWURKdmpLeUE9PSIsInZhbHVlIjoiQlhXRTFNcXZKblhxSzJRYTBWK1pMc2VLM0owWUpLRk9JWTZXT04rZlJYRT0iLCJtYWMiOiIxZjk5Yjc5ZmRlZDFlNThmNWQ5ZTc3ZDdiMTMzYzU0ZmRiOTIxY2NlM2IxYjZlNjk5NDEzMGUzMzEzOTA1ZGEwIn0',
      data: {
        intent_url:
          'upi://pay?pa=upi@razopay&pn=Razorpay&tr=1UIWQ1mLDGYBQbR&tn=razorpay&am=10.24&cu=INR&mc=5411',
      },
      request: {
        url:
          'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
        method: 'GET',
      },
    });
  } else {
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

async function handleUPIAccountValidation(context, vpa) {
  const req = await context.expectRequest();
  expect(req.url).toContain('validate/account');
  await context.respondJSON({ vpa: vpa, success: true, customer_name: null });
  // await delay(1000);
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

async function selectBankNameFromGooglePayDropDown(context, valuetoBeSelected) {
  await context.page.select('select[name="gpay_bank"]', valuetoBeSelected);
}

module.exports = {
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectBankNameFromGooglePayDropDown,
  selectUPIApp,
};
