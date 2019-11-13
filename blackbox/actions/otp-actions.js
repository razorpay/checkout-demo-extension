const { delay } = require('../util');

async function handleOtpVerification(context, walletissuer) {
  if (walletissuer == undefined) walletissuer = 'freecharge';
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'otp',
    request: {
      url:
        'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
      method: 'post',
      content: { next: ['resend_otp'] },
    },
    payment_id: 'pay_DLbzHmbxvcpY9o',
    contact: '+919999999999',
    amount: '51.00',
    formatted_amount: '\u20b9 51',
    wallet: walletissuer,
    merchant: 'RBL Bank',
  });
}

async function typeOTPandSubmit(context) {
  await typeOTP(context);
  await delay(1200);
  await context.page.click('.otp-btn');
}
async function typeOTP(context) {
  await delay(800);
  await context.page.type('#otp', '5555');
}

module.exports = {
  typeOTP,
  typeOTPandSubmit,
  handleOtpVerification,
};
