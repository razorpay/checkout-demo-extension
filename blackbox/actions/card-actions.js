const { delay } = require('../util');

async function handleCardValidation(
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
      submit_url:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp_submit/c8aafb01f805301c93f9607c0e02679b01d479ff?key_id=rzp_live_ILgsfZCZoFIKMb',
      resend_url:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/resend',
      metadata: {
        issuer: 'HDFC',
        network: 'MC',
        last4: '9275',
        iin: '512967',
      },
      redirect:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
      submit_url_private:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/submit',
      resend_url_private:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/resend',
    });
  } else {
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
  retryCardTransaction,
};
