const { delay, visible } = require('../util');
const { readFileSync } = require('fs');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

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

module.exports = {
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation,
};
