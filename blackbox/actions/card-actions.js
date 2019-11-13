const { delay } = require('../util');

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
  await delay(1000);
}

async function handleCardValidationWithCallback(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/checkout');
  await context.respondPlain(contents);
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

async function retryCardTransaction(context) {
  const retryButton = await context.page.waitForSelector('#fd-hide');
  await retryButton.click();
  await delay(500);
}

module.exports = {
  enterCardDetails,
  handleCardValidation,
  handleCardValidationWithCallback,
  retryCardTransaction,
};
