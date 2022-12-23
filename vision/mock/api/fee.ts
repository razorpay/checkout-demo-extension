import type { handlerType } from '../../core/types';

const calculateFee = ({
  amount,
  currency,
  dcc,
}: {
  amount: number;
  currency: string;
  dcc: number;
}) => {
  const razorpay_fee = +parseFloat(amount * dcc ? '0.08' : '0.02').toFixed(2);
  const tax = +parseFloat((razorpay_fee * 0.18).toString()).toFixed(2);

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

function getFeeBearer(name, request) {
  const amount = parseInt(request.amount, 10) / 100;
  const currency = request.dcc_currency || request.currency;
  const fee = calculateFee({ amount, currency, dcc: +!!request.dcc_currency });
  switch (name) {
    default:
      return {
        input: {
          ...request,
          amount: fee.amount * 100,
          fee: fee.fees * 100,
          tax: fee.tax * 100,
        },
        display: fee,
      };
  }
}

const feeBearerHandler: handlerType = function ({ name, request }) {
  let response = getFeeBearer(name, request.postDataJSON());
  if (!response) {
    console.info(`No preference response found for context:${name}`);
    return {
      response: {},
    };
  }
  return {
    response,
  };
};

export default feeBearerHandler;
