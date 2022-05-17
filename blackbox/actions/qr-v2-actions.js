var querystring = require('querystring');
const { assertVisible } = require('../util');
async function assertRefreshButton(context) {
  assertVisible('div[data-testid="refresh"]');
}

async function clickOnRefreshButton(context) {
  const refreshButton = await context.page.waitForSelector(
    'div[data-testid="refresh"]'
  );

  /**
   * Direct clicks not working
   */
  await context.page.evaluate(
    (refreshButton) => refreshButton.click(),
    refreshButton
  );
}

async function assertQRV2(context) {
  await assertVisible('div[data-testid="qrV2"]');
}

async function respondToQRV2Ajax(
  context,
  { recurring, offerId = '', _req } = {}
) {
  const req = _req || (await context.expectRequest());
  if (offerId != '') {
    expect(req.body).toContain(offerId);
  }
  expect(req.url).toContain('create/ajax');
  if (recurring) {
    expect(req.body).toContain('recurring=1');
  }

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
      url: 'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'GET',
    },
  });
}

const paymentStatusResult = {
  success: { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' },
  error: {
    error: {
      code: 'GATEWAY_ERROR',
      description:
        'Payment failed. Please try again with another bank account.',
      source: 'issuer_bank',
      step: 'payment_debit_request',
      reason: 'payment_declined',
      metadata: {
        payment_id: 'pay_JTyJ9kZYKVyNRh',
      },
    },
    http_status_code: 502,
  },
  created: {
    status: 'created',
    http_status_code: 200,
  },
};

async function respondToQRV2PaymentStatus(context, _req, status = 'success') {
  const req = _req || (await context.expectRequest());
  expect(req.url).toContain('status?key_id');
  await context.respondPlain(
    `${req.params.callback}(${JSON.stringify(paymentStatusResult[status])})`
  );
}

module.exports = {
  assertQRV2,
  respondToQRV2PaymentStatus,
  respondToQRV2Ajax,
  assertRefreshButton,
  clickOnRefreshButton,
};
