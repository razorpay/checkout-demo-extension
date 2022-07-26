const { delay } = require('../util');

async function handleOtpVerification(context, walletissuer = 'freecharge') {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'otp',
    request: {
      url: 'https://api.razorpay.com/v1/payments/pay_DLbzHmbxvcpY9o/otp_submit/a393006fdb3d80bd41d199010375f4da5ea718da?key_id=rzp_test_1DP5mmOlF5G5ag',
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

async function acceptTermsandConditions(context) {
  await delay(500);
  await context.page.waitForSelector('#emi-tnc');
  await context.page.click('#emi-tnc');
}

async function typeOTPandSubmit(context, otpValue = '5555') {
  await typeOTP(context, otpValue);
  await delay(500);
  const footer = await context.page.waitForSelector('#footer', {
    visible: true,
  });
  await footer.click();
}
async function typeOTP(context, otpValue) {
  await context.page.waitForSelector('#otp', {
    visible: true,
  });
  await context.page.type('#otp', otpValue);
}

async function verifyOTP(context, passOrFail) {
  const req = await context.expectRequest();
  if (passOrFail == 'fail') {
    await context.failRequest({
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment processing failed because of incorrect OTP',
        action: 'RETRY',
      },
    });
  } else if (passOrFail == 'pass') {
    await context.respondJSON({ razorpay_payment_id: 'pay_123' });
  }
}

async function resendOTP(context) {
  const resendOTPButton = await context.page.$('#otp-resend');
  await resendOTPButton.click();
  await context.expectRequest();
  await context.respondJSON({
    type: 'otp',
    request: {
      method: 'direct',
      content: '<html></html>',
    },
    version: 1,
    payment_id: 'pay_DevaXGbxgAKHE9',
    next: ['otp_submit'],
    gateway: 'eyJpdiI6InZyajhcLzFyZnppVEhtRkJHN0dKN',
    submit_url:
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp_submit/c8aafb01f805301c93f9607c0e02679b01d479ff?key_id=rzp_live_ILgsfZCZoFIKMb',
    resend_url:
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/resend',
    metadata: {
      issuer: 'HDFC',
      network: 'MC',
      last4: '9275',
      iin: '512967',
    },
    redirect:
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
    submit_url_private:
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/submit',
    resend_url_private:
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/otp/resend',
  });
}

async function goToBankPage(context) {
  const goToBank = await context.page.waitForSelector('#otp-sec');
  await goToBank.click();
}

module.exports = {
  typeOTP,
  typeOTPandSubmit,
  handleOtpVerification,
  verifyOTP,
  resendOTP,
  goToBankPage,
  acceptTermsandConditions,
};
