export const payloadData = {
  contact: '+919952398401',
  email: 'abisheksrv@gmail.com',
  amount: 1000000,
  currency: 'INR',
  description: 'JEE Main & Advanced',
  key_id: 'rzp_test_1DP5mmOlF5G5ag',
  '_[shield][fhash]': 'f09987f571e749bfa6ddecb3fe415aacd4c6797c',
  '_[device_id]':
    '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
  '_[shield][tz]': 330,
  '_[build]': null,
  '_[checkout_id]': 'KoBRPx3y3ygoNx',
  '_[device.id]':
    '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
  '_[env]': '__S_TRAFFIC_ENV__',
  '_[library]': 'checkoutjs',
  '_[platform]': 'browser',
  '_[referer]': 'http://localhost:8000/',
  '_[request_index]': 0,
};

export const nativeOTPWalletResponse = {
  type: 'otp',
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_Kl5Sx4VEMzVXYq/otp_submit/25864635546caf1f3779d21ccacd050125ba5807?key_id=rzp_live_ILgsfZCZoFIKMb',
    method: 'post',
    content: {
      next: ['resend_otp'],
    },
  },
  version: 1,
  payment_id: 'pay_Kl5Sx4VEMzVXYq',
  gateway: 'eyJpdiI6IjB3M08zWGdvYkU',
  contact: '+919952398401',
  amount: '1.00',
  formatted_amount: '₹ 1',
  wallet: 'freecharge',
  merchant: 'Razorpay',
  merchant_id: '2aTeFCKTYWwfrF',
  theme_color: '#528FF0',
  nobranding: false,
  status_code: 200,
};

export const nativeOTPCardResponse = {
  type: 'otp',
  request: {
    method: 'direct',
    content: '<!doctype html></html>\n',
  },
  version: 1,
  payment_id: 'pay_Kl5jtlO7rU0jFN',
  next: ['otp_submit', 'otp_resend'],
  gateway: 'eyJpdiI6ImIxemlINzRHVFlCZHR',
  submit_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_submit/9be?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend?key_id=rzp_live_ILgsfZCZoFIKMb',
  metadata: {
    issuer: 'HDFC',
    network: 'VISA',
    last4: '7222',
    iin: '416222',
  },
  redirect:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url_json:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend/json?key_id=rzp_live_ILgsfZCZoFIKMb',
  submit_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/submit',
  resend_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/resend',
  status_code: 200,
};

export const emiOTPResponse = {
  type: 'otp',
  request: {
    method: 'direct',
    content: '<!doctype html></html>\n',
  },
  version: 1,
  payment_id: 'pay_Kl5jtlO7rU0jFN',
  next: ['otp_submit', 'otp_resend'],
  gateway: 'eyJpdiI6ImIxemlINzRHVFlCZHR',
  submit_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_submit/9be?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend?key_id=rzp_live_ILgsfZCZoFIKMb',
  metadata: {
    issuer: 'HDFC',
    network: 'VISA',
    last4: '7222',
    iin: '416222',
  },
  redirect:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url_json:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend/json?key_id=rzp_live_ILgsfZCZoFIKMb',
  submit_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/submit',
  resend_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/resend',
  status_code: 200,
};

export const cardOTPResponse = {
  type: 'otp',
  request: {
    method: 'direct',
    content: '<!doctype html></html>\n',
  },
  version: 1,
  payment_id: 'pay_Kl5jtlO7rU0jFN',
  next: ['otp_submit', 'otp_resend'],
  gateway: 'eyJpdiI6ImIxemlINzRHVFlCZHR',
  submit_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_submit/9be?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend?key_id=rzp_live_ILgsfZCZoFIKMb',
  metadata: {
    issuer: 'HDFC',
    network: 'VISA',
    last4: '7222',
    iin: '416222',
  },
  redirect:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
  resend_url_json:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp_resend/json?key_id=rzp_live_ILgsfZCZoFIKMb',
  submit_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/submit',
  resend_url_private:
    'https://api.razorpay.com/v1/payments/pay_Kl5jtlO7rU0jFN/otp/resend',
  status_code: 200,
};

export const intentUPIResponse = {
  type: 'intent',
  method: 'upi',
  provider: null,
  version: 1,
  payment_id: 'pay_KoBLKy9NtjAsFx',
  gateway:
    'eyJpdiI6IkZZNUIzaXE1L3FLb3JnTEJKOHJSYUE9PSIsInZhbHVlIjoiVXE4WCsvVnBZTHRaakJaVExhcGczK1RnN3BJWGR6TWFhcUpyMko3ZFZ4cz0iLCJtYWMiOiJkOTJiN2MxNzYyZWM2NWRhOWZmYmYzY2IwMmZlZjQ3MTcyYjE1NWYxOWJiNWE4NmNiY2RjNGMzOTdmM2UwODRiIiwidGFnIjoiIn0=',
  data: {
    intent_url:
      'upi://pay?pa=upi@razopay&pn=Social&tr=XPEX8B6HR2mQW4A&tn=razorpay&am=10000&cu=INR&mc=5411',
  },
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_KoBLKy9NtjAsFx/status?key_id=rzp_test_1DP5mmOlF5G5ag',
    method: 'GET',
  },
  status_code: 200,
};

export const gpayInAppResponse = {
  type: 'gpay_inapp',
  method: 'upi',
  provider: 'GOOGLE_PAY',
  version: 1,
  payment_id: 'pay_KoumSWXZBrqGnp',
  gateway:
    'eyJpdiI6Ilp6RzlEV2ppK2orRE9pM3JsV2tnRmc9PSIsInZhbHVlIjoiNkVXOU9PQ0hvSzJHOVBYS3l5TGYxa1JtM2RuOUVSeVlhWGI2WjNtVzZIMD0iLCJtYWMiOiJlMjQyZmFhOTMyM2U0NjRlOGU2OGVjZGZlYzQ4OWM4ZTU2OTY3MTVhNjg5OTY0ODhiN2UwMjJhZmNiMTc2NTBmIiwidGFnIjoiIn0=',
  data: {
    intent_url:
      'upi://pay?pa=novidigitalentertainmentprivatelimited.rzp@sbi&pn=NoviDigitalEntertainmentPrivateLimited&tn=NovidigitalentertainmentprivateLtdstaticRpDes&tr=KoumSWXZBrqGnp&am=1.00&cu=INR&mc=7299',
  },
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_KoumSWXZBrqGnp/status?key_id=rzp_live_ScujOyAgRJLJgO',
    method: 'GET',
  },
};

export const cardlessEMIResponse = {
  type: 'respawn',
  method: 'cardless_emi',
  request: {
    url: 'https://api-3.qa.razorpay.in/v1/otp/verify?method=cardless_emi&provider=earlysalary&payment_id=pay_Kocchq5FGF506s&key_id=rzp_test_QrCoXWQWtIQSSY',
    method: 'POST',
    content: {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      method: 'cardless_emi',
      provider: 'earlysalary',
      amount: '1000000',
      currency: 'INR',
      description: 'JEE Main & Advanced',
      _: {
        shield: {
          fhash: '795b675d7fdd97b84ae209be041cbc552cc57e9b',
          tz: '330',
        },
        device_id:
          '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
        checkout_id: 'KocbAyCUgSl78p',
        'device.id':
          '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
        env: '__S_TRAFFIC_ENV__',
        library: 'checkoutjs',
        platform: 'browser',
        referer: 'http://localhost:8000/',
        request_index: '0',
      },
      payment_id: 'pay_Kocchq5FGF506s',
    },
  },
  image: null,
  theme: '#3594E2',
  merchant: 'bindhu',
  gateway:
    'eyJpdiI6IklVWmlkUzh4MG5aaC9TUisyV2NNVnc9PSIsInZhbHVlIjoiUTB3eml1T0xTSGx4MGU5SUhuMWl4azJKRk9tWGhiWlFldG9EUXM5RFFWUUU3TTZUNHhRNzFvd1pMY0NweGU3MyIsIm1hYyI6ImY0ZjY1M2Q0MDU2MzhjMTg3YTVmZWQxNWIwNzg0NTRiZWY0MzJhNzVkZTA4ZTVlZjI2NzkwM2EwMTQ0MjhjNzQiLCJ0YWciOiIifQ==',
  key_id: 'rzp_test_QrCoXWQWtIQSSY',
  version: '1',
  payment_create_url:
    'https://api-3.qa.razorpay.in/v1/payments?key_id=rzp_test_QrCoXWQWtIQSSY',
  resend_url:
    'https://api-3.qa.razorpay.in/v1/otp/create?key_id=rzp_test_QrCoXWQWtIQSSY',
  payment_id: 'pay_Kocchq5FGF506s',
  status_code: 200,
};

export const appCredResponse = {
  type: 'async',
  method: 'app',
  provider: 'cred',
  version: 1,
  payment_id: 'pay_KoaltMToqA3mee',
  gateway:
    'eyJpdiI6Ik9ubDU2cjg1KzNUOWRFb3FvcnRZOUE9PSIsInZhbHVlIjoibFcwT0tZRmR2N0l5aGRBRnhJc3BESks1QTJBOGFXMXJVYVhvTWh0MzZGQT0iLCJtYWMiOiIyMTA1MGRiOTNhZDFkMWNjZmYzYmY3Mzg3Njk4MDhiZGE5Yjg2OTZlM2Y3MGZjZmM2MmZjNzA4NmNiZjFiOGQ4IiwidGFnIjoiIn0=',
  data: {
    vpa: '05a45348-a90d-4734-99d4-502348df280f',
  },
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_KoaltMToqA3mee/status?key_id=rzp_live_cepk1crIu9VkJU',
    method: 'GET',
  },
  status_code: 200,
};

export const gpaySDKResponse = {
  version: '1.0',
  type: 'application',
  application_name: 'google_pay',
  payment_id: 'pay_GqAUUr978elhqA',
  gateway: '*encrypted gateway value*',
  request: {
    url: 'https://api.razorpay.com/v1/payments/pay_GqAUUr978elhqA/status',
    method: 'sdk',
    content: {
      bundle: {
        apiVersion: '1.0',
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedCardNetworks: ['VISA', 'MASTERCARD'],
            },
          },
        ],
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'razorpay',
            gatewayMerchantId: 'Gr978elhqAGqAU',
            gatewayTransactionId: 'pay_GqAUUr978elhqA',
          },
        },
        transactionInfo: {
          currencyCode: 'INR',
          totalPrice: '100',
          totalPriceStatus: 'FINAL',
        },
      },
    },
  },
};
