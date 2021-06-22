const { readFileSync } = require('fs');
const callbackLocation = __dirname + '/../fixtures/callback.html';
const callbackTemplate = String(readFileSync(callbackLocation));

function callbackHtml(paymentResult) {
  return callbackTemplate.replace(
    '// Callback data //',
    JSON.stringify(paymentResult)
  );
}

async function callbackPage(context, response) {
  const req = await context.expectRequest();
  expect(req.raw.isNavigationRequest()).toBe(true);
  expect(req.method).toBe('POST');
  await context.respondHTML(callbackHtml(response));
}

const getMockResponse = (success = true) => {
  if (success) {
    return callbackHtml("{ razorpay_payment_id: 'pay_123465' }");
  } else {
    return callbackHtml(
      '{"error":{"code":"BAD_REQUEST_ERROR","description":"The payment has already been processed","source":"internal","step":"payment_authorization","reason":"bank_technical_error","metadata":{}},"http_status_code":400,"org_logo":"","org_name":"Razorpay Software Private Ltd","checkout_logo":"https://dashboard-activation.s3.amazonaws.com/org_100000razorpay/checkout_logo/phpnHMpJe","custom_branding":false};'
    );
  }
};

module.exports = {
  callbackPage,
  callbackHtml,
  getMockResponse,
};
