const { visible } = require('../util');

async function handleFeeBearer(
  context,
  pressContinue,
  originalAmount = '₹ 600'
) {
  let req = await context.expectRequest();
  expect(req.method).toEqual('POST');
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
      fees: 20.54,
      razorpay_fee: 17.4,
      tax: 3.14,
      amount: 620.54,
    },
  });
  const feeAmount11 = await context.page.$$('.fee-amount');
  feeAmount = feeAmount11[0];
  expectedfeeAmount1 = originalAmount;
  const feeAmount1 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount1).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[1];
  expectedfeeAmount1 = '₹ 17.40';
  const feeAmount2 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount2).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[2];
  expectedfeeAmount1 = '₹ 3.14';
  const feeAmount3 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount3).toEqual(expectedfeeAmount1);
  feeAmount = feeAmount11[3];
  expectedfeeAmount1 = '₹ 620.54';
  const feeAmount4 = await context.page.evaluate(
    feeAmount => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount4).toEqual(expectedfeeAmount1);
  if (pressContinue != false) {
    context.page.click('.fee-bearer .btn');
    await delay(400);
  }
}

module.exports = {
  handleFeeBearer,
};
