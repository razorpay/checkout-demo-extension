export function* paymentStatus({ request, response }) {
  yield response.jsonp({
    razorpay_payment_id: 'pay_KBkMjACVVy1CD1',
    http_status_code: 200,
  });
}
