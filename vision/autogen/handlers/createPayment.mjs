export function* createAjax({ options, params, request }) {
  yield {
    razorpay_payment_id: 'rzp_123',
  };
}

export function* createCheckout({ options, params, request }) {
  yield `<script>opener.onComplete({razorpay_payment_id: 'rzp_123'})</script>`;
}
