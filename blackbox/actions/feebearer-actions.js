const { visible, delay } = require('../util');

let feeAmount;
let expectedAmount;
async function handleFeeBearer(context, pressContinue) {
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
  expectedAmount = context.isRedesignV15Enabled ? '₹600' : '₹ 600';
  const feeAmount1 = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount1).toEqual(expectedAmount);
  feeAmount = feeAmount11[1];
  expectedAmount = context.isRedesignV15Enabled ? '₹17.40' : '₹ 17.40';
  const feeAmount2 = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount2).toEqual(expectedAmount);
  feeAmount = feeAmount11[2];
  expectedAmount = context.isRedesignV15Enabled ? '₹3.14' : '₹ 3.14';
  const feeAmount3 = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount3).toEqual(expectedAmount);
  feeAmount = feeAmount11[3];
  expectedAmount = context.isRedesignV15Enabled ? '₹620.54' : '₹ 620.54';
  const feeAmount4 = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmount4).toEqual(expectedAmount);
  if (pressContinue != false) {
    context.page.click('.fee-bearer .btn');
    await delay(400);
  }
}

async function assertDynamicFeeBearer(context, step, waitForClosure) {
  const containerId = context.isRedesignV15Enabled ? '#fee-wrapper' : '#amount';
  expect(
    await context.page.$eval(`${containerId} > span.fee > div`, visible)
  ).toEqual(true);
  if (step === 1) {
    // Step 1 to check if the tooltip has been displayed
    //  intially with generic message and merchant custom message if any
    expect(
      await context.page.$eval(
        `${containerId} > span.fee > div > span > div > div > p:nth-child(1)`,
        visible
      )
    ).toEqual(true);
  }
  if (step === 2) {
    // Step 2 to check if fees from preferences is updated as a breakup on the
    // the tool tip
    expect(
      await context.page.$eval(
        `${containerId} > span.fee > div > span > div > div > div.dynamic-fee-breakup-block`,
        visible
      )
    ).toEqual(true);
  }

  let merchantMessage = await context.preferences.order.convenience_fee_config
    .checkout_message;
  if (merchantMessage) {
    expect(
      await context.page.$eval(
        `${containerId} > span.fee > div > span > div > div > p.dynamic-optional-message`,
        visible
      )
    ).toEqual(true);
    let textDisplayedInUI = await context.page.$eval(
      `${containerId} > span.fee > div > span > div > div > p.dynamic-optional-message`,
      (el) => el.innerText
    );
    textDisplayedInUI = textDisplayedInUI.trim().toLowerCase();
    merchantMessage = merchantMessage.trim().toLowerCase();
    expect(textDisplayedInUI).toEqual(merchantMessage);
  }
  if (waitForClosure) await delay(4000);
}

function modifyPreferencesForDynamicFeeBearer() {
  let order = {
    amount: 60000,
    amount_due: 100,
    amount_paid: 0,
    currency: 'INR',
    first_payment_min_amount: null,
    partial_payment: false,
    convenience_fee_config: {
      checkout_message:
        'To avoid transaction fees please complete payment using UPI or Netbanking.',
      label_on_checkout: 'Additional Fees', //new
      methods: {
        card: {
          amount: 0.2,
          types: {
            debit: {
              amount: 0,
            },
            credit: {
              amount: 0.4,
            },
          },
        },
        netbanking: {
          amount: 1.5,
        },
        upi: {
          amount: 0.5,
        },
      },
    },
  };
  return order;
}

const calculateFee = ({ amount, currency, dcc }) => {
  const razorpay_fee = +parseFloat(amount * dcc ? 0.08 : 0.02).toFixed(2);
  const tax = +parseFloat(razorpay_fee * 0.18).toFixed(2);

  return {
    currency,
    fees: razorpay_fee + tax,
    originalAmount: amount,
    original_amount: amount,
    razorpay_fee,
    tax: tax,
    amount: amount + razorpay_fee + tax,
  };
};

const expectFeeBearerRequest = async ({ context, dcc, isAVS }) => {
  let req = await context.expectRequest();
  expect(req.method).toEqual('POST');

  const deserializeRequestBody = (body) => {
    const data = body.split('&');
    const obj = {};
    data.forEach((item) => {
      const [key, value] = item.split('=');
      obj[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return obj;
  };

  const responseData = deserializeRequestBody(req.body);
  const amount = parseInt(responseData.amount, 10);

  // check for dcc payload
  const dccCurrency = responseData.dcc_currency;

  if (dcc) {
    expect(typeof dccCurrency).toBe('string');
    expect(typeof responseData.currency_request_id).toBe('string');
  } else {
    // strictly check DCC payload is not present
    expect(dccCurrency).toBeUndefined();
    expect(responseData.currency_request_id).toBeUndefined();
  }

  if (isAVS) {
    expect(typeof responseData['billing_address[line1]']).toBe('string');
    expect(responseData['billing_address[line2]']).toBeDefined();
    expect(typeof responseData['billing_address[city]']).toBe('string');
    expect(typeof responseData['billing_address[country]']).toBe('string');
    expect(typeof responseData['billing_address[postal_code]']).toBe('string');
    expect(typeof responseData['billing_address[state]']).toBe('string');
  } else {
    // strictly check AVS payload is not present
    expect(responseData['billing_address[line1]']).toBeUndefined();
    expect(responseData['billing_address[line2]']).toBeUndefined();
    expect(responseData['billing_address[city]']).toBeUndefined();
    expect(responseData['billing_address[country]']).toBeUndefined();
    expect(responseData['billing_address[postal_code]']).toBeUndefined();
    expect(responseData['billing_address[state]']).toBeUndefined();
  }

  const calculatedFee = calculateFee({
    amount,
    currency: dccCurrency || responseData.currency,
    dcc: dccCurrency !== undefined,
  });

  await context.respondJSON({
    input: responseData,
    display: calculatedFee,
  });

  return calculatedFee;
};

const verifyFeeBearerAmountOnUI = async (
  context,
  feeBearerAmount = {},
  symbol = '₹'
) => {
  const feeElement = await context.page.$$('.fee-amount');
  feeAmount = feeElement[0];
  let feeAmountText = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmountText).toEqual(`${symbol} ${feeBearerAmount.original_amount}`);
  feeAmount = feeElement[1];
  feeAmountText = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmountText).toEqual(`${symbol} ${feeBearerAmount.razorpay_fee}`);
  feeAmount = feeElement[2];
  feeAmountText = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmountText).toEqual(`${symbol} ${feeBearerAmount.tax}`);
  feeAmount = feeElement[3];
  feeAmountText = await context.page.evaluate(
    (feeAmount) => feeAmount.textContent,
    feeAmount
  );
  expect(feeAmountText).toEqual(`${symbol} ${feeBearerAmount.amount}`);
};

module.exports = {
  handleFeeBearer,
  expectFeeBearerRequest,
  assertDynamicFeeBearer,
  verifyFeeBearerAmountOnUI,
  modifyPreferencesForDynamicFeeBearer,
};
