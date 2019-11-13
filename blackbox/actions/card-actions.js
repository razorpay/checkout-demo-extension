const { delay } = require('../util');

async function handleCardValidation(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
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
  await delay(1000);
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
  retryCardTransaction,
};
