function getCODPaymentResponse() {
  const resp = {
    razorpay_payment_id: 'pay_zxzxzxzxzxzxzx',
    razorpay_order_id: 'order_zxzxzxzxzxzxzx',
    razorpay_signature: 'e3cb8504cd2411ab0309dad',
  };

  return resp;
}

async function handleCODPayment(context) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('create/ajax');
  await context.respondJSON(getCODPaymentResponse());
}

async function checkDisabledCOD(context) {
  await context.page.waitForSelector('button.new-method[method=cod][disabled]');
}

module.exports = {
  handleCODPayment,
  checkDisabledCOD,
};
