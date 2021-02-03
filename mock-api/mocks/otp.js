const { ENDPOINT } = global;

const submit = {
  success: {
    razorpay_payment_id: 'pay_EfaGm4YEWwDLMc',
  },
  incorrect: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment processing failed because of incorrect OTP',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'incorrect_otp',
      metadata: { payment_id: 'pay_F7AmGUbE5GkBLx' },
      action: 'RETRY',
    },
    next: { bank: 'HDFC', type: 'otp', next: ['submit_otp', 'resend_otp'] },
  },
};

const resend = {
  hdfc: {
    type: 'otp',
    request: {
      method: 'direct',
      content: '',
    },
    version: 1,
    payment_id: 'pay_Ep1kkNJDzAdvIZ',
    next: ['otp_submit', 'otp_resend'],
    gateway:
      'eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp_submit/4a6a87fce1bc82588be5f299b42ab93792554f36?key_id=rzp_live_ILgsfZCZoFIKMb',
    resend_url: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
    metadata: {
      issuer: 'HDFC',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'hitachi',
      contact: '9723461024',
      ip: '10.2.1.33',
      resend_timeout: 10,
    },
    unused_redirect:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
    submit_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/submit',
    resend_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
  },
};

const getOtpSubmit = type => {
  return submit[type];
};

const getOtpResend = type => {
  return resend[type];
};

module.exports = { getOtpSubmit, getOtpResend };
