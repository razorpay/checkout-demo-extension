const { delay, visible } = require('../util');
async function selectUPIApp(context, AppNumber) {
  await context.page.click('.option:nth-of-type(' + AppNumber + ')');
}

async function selectUPIApplication(context, AppNumber) {
  const apiOption = await context.page.$x(
    '//div[contains(text(),"' + AppNumber + '")]'
  );
  await apiOption[0].click();
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

async function respondToQRAjax(context, offerId) {
  const req = await context.expectRequest();
  if (offerId != '') expect(req.body).toContain(offerId);
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'intent',
    version: 1,
    payment_id: 'pay_DiAHr1NjHQJxcH',
    gateway:
      'eyJpdiI6IkdhRUdjaTJ6dXc0OUlhRU54QWxRbEE9PSIsInZhbHVlIjoiaTZ6ckZzc1d5OElncmIxZ3hCVVZudVZaWmJ3XC82TU9yMXB5K0ttcVVCaG02aGZlSHJwNCt4V29Hc3pBZWRxeHciLCJtYWMiOiJlZmE0NDM2ZDNkZTI5NDA1NGIxYjFiYmM1NDk4ZGNmNjM3ZmQ5N2NhNzYzYTk2MDlkZDRhNWRhZjZkMmMzOWI4In0',
    data: {
      intent_url:
        'upi://pay?pa=razorpay.pg@hdfcbank&pn=Razorpay&tr=DiAHr1NjHQJxcH&tn=Razorpay&am=6000&cu=INR&mc=5411',
    },
    request: {
      url:
        'https://api.razorpay.com/v1/payments/pay_DiAHr1NjHQJxcH/status?key_id=rzp_live_ILgsfZCZoFIKMb',
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

async function respondToQRPaymentStatus(context) {
  const successResult = { razorpay_payment_id: 'pay_DiAHr1NjHQJxcH' };
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

async function validateQRImage(context) {
  expect(await context.page.$eval('[alt=QR]', visible)).toEqual(true);
}
module.exports = {
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectUPIApp,
  selectUPIApplication,
  respondToQRAjax,
  respondToQRPaymentStatus,
  validateQRImage,
};
