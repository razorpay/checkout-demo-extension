export function* createPayment({ options, params, request, response }) {
  const paymentResponse = PaymentResponse({ params, response });
  yield paymentResponse({
    id: 'payment_success',
    label: 'Successful Payment',
    data: {
      razorpay_payment_id: 'rzp_123',
    },
  });
}

function PaymentResponse({ params, response }) {
  switch (params.type) {
    case 'ajax':
      return response.json;

    case 'checkout':
      return ({ id, label, data }) =>
        response.html({
          id,
          label,
          data: `<script>opener.onComplete(${JSON.stringify(data)})</script>`,
        });

    default:
      throw new Error(`unknown create payment ${params.type}`);
  }
}
