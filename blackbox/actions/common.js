const { openCheckout } = require('../checkout');
const common = require('../actions/common');
const { makePreferences } = require('../actions/preferences');
const { delay } = require('../util');
const assert = require('../assert');

module.exports = {
  handleFeeBearer,
};

async function handleFeeBearer(context, page) {
  await context.expectRequest(req => {
    assert.equal(req.method, 'POST');
  });
  await context.respondJSON({
    input: {
      contact: '9999988888',
      email: 'pro@rzp.com',
      amount: 62054,
      method: 'netbanking',
      bank: 'IDFB',
      currency: 'INR',
      _: {
        shield: {
          fhash: 'b8d153db696c383755848673264644e61927c1d3',
          tz: '330',
        },
        checkout_id: 'DLwoGw9hp2q2L1',
        referer: 'https://api.razorpay.com/test/layout.php',
        library: 'checkoutjs',
        platform: 'browser',
      },
      fee: 2054,
    },
    display: {
      originalAmount: 600,
      original_amount: 600,
      fees: 20.539999999999999,
      razorpay_fee: 17.399999999999999,
      tax: 3.1400000000000001,
      amount: 620.53999999999996,
    },
  });
  const feeAmount11 = await page.$x('//*[@class = "fee-amount"]');
  feeAmount = feeAmount11[0];
  expectedfeeAmount1 = '₹ 600';
  const feeAmount1 = await page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  assert.equal(feeAmount1, expectedfeeAmount1);
  feeAmount = feeAmount11[1];
  expectedfeeAmount1 = '₹ 17.40';
  const feeAmount2 = await page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  assert.equal(feeAmount2, expectedfeeAmount1);
  feeAmount = feeAmount11[2];
  expectedfeeAmount1 = '₹ 3.14';
  const feeAmount3 = await page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  assert.equal(feeAmount3, expectedfeeAmount1);
  feeAmount = feeAmount11[3];
  expectedfeeAmount1 = '₹ 620.54';
  const feeAmount4 = await page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  assert.equal(feeAmount4, expectedfeeAmount1);
  const continueButton = await page.$x(
    '//*[@class="btn" and text() = "Continue"]'
  );
  await continueButton[0].click();
  // await delay(200);
}
