const { delay } = require('../util');

async function handleCardValidation(context, { urlShouldContain } = {}) {
  const req = await context.expectRequest();
  expect(req.url).toContain(urlShouldContain || 'create/ajax');
  await context.respondJSON({
    type: 'first',
    request: {
      url: 'http://localhost:9008',
      method: 'get',
      content: [],
    },
    payment_id: 'pay_DLXKaJEF1T1KxC',
    amount: '\u20b9 51',
    image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
  });
}

async function handleCardValidationForNativeOTP(
  context,
  { coproto, urlShouldContain } = {}
) {
  const req = await context.expectRequest();
  expect(req.url).toContain(urlShouldContain || 'create/ajax');
  if (coproto === 'otp') {
    await context.respondJSON({
      type: 'otp',
      request: {
        method: 'direct',
        content: '<html></html>',
      },
      version: 1,
      payment_id: 'pay_DevaXGbxgAKHE9',
      next: ['otp_submit', 'otp_resend'],
      gateway: 'eyJpdiI6InZyajhcLzFyZnppVEhtRkJHN0dKN',
      submit_url: 'https://api.razorpay.com/otp_submit',
      resend_url: 'https://api.razorpay.com/otp_resend',
      metadata: {
        issuer: 'HDFC',
        network: 'MC',
        last4: '9275',
        iin: '512967',
      },
      redirect: 'http://localhost:9008',
      submit_url_private: 'https://api.razorpay.com/otp_submit',
      resend_url_private: 'https://api.razorpay.com/otp_resend',
    });
  } else {
    await context.respondJSON({
      type: 'first',
      request: {
        url: 'https://api.razorpay.com/bank',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
  }
}

async function handleBankRequest(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('api.razorpay.com/bank');
  await context.respondHTML(`<html></html>`);
}

async function enterCardDetails(context, { cardType, nativeOtp = false } = {}) {
  const cardNum = await context.page.waitForSelector('#card_number');
  if (cardType == undefined) await cardNum.type('5241 9333 8074 0001');
  else if (cardType == 'VISA') await cardNum.type('4111 1111 1111 1111');
  await context.expectRequest(req => {});
  const flows = {
    recurring: false,
    iframe: true,
    http_status_code: 200,
  };
  if (nativeOtp) {
    flows.otp = true;
  }
  await context.respondJSONP(flows);
  await context.page.type('#card_expiry', '12/55');
  await context.page.type('#card_name', 'SakshiJain');
  await context.page.type('#card_cvv', '112');
}

async function retryCardTransaction(context) {
  const retryButton = await context.page.waitForSelector('#fd-hide');
  await retryButton.click();
}

module.exports = {
  enterCardDetails,
  handleCardValidation,
  handleCardValidationForNativeOTP,
  handleBankRequest,
  retryCardTransaction,
};
