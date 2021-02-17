const { interceptor } = require('../../util');
const { readFileSync } = require('fs');
const API = require('./mockApi');

const prefix = 'https://api.razorpay.in/v1/checkout';

const customCheckout = `${prefix}/custom`;
const popupInitialPage = `${prefix}/mockup`;
const razorpayJS = `${prefix}/js/generated/entry/razorpay.js`;
const otpBundle = 'https://cdn.razorpay.com/static/otp/bundle.js';

const popupCallbackRequest =
  'https://api.razorpay.com/v1/payments/pay_GZ7c6a2d9mfWAG';

const jsContent = readFileSync('app/js/generated/entry/razorpay.js');
const htmlContent = readFileSync('app/razorpay.test.html');
const popupHtmlContent = readFileSync('blackbox/fixtures/mockSFPage.html');
const otpPageBundle = readFileSync('blackbox/fixtures/otpbundle.js');
const callback = readFileSync('blackbox/fixtures/callback.html', {
  encoding: 'utf8',
  flag: 'r',
});

function checkoutRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(customCheckout)) {
    return request.respond({ body: htmlContent });
  } else if (url.includes('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (url === razorpayJS) {
    return request.respond({ body: jsContent });
  } else if (url.startsWith('https://lumberjack.razorpay.com')) {
    return request.respond({ status: 200 });
  } else if (url.startsWith('data')) {
    return;
  } else if (url.includes('livereload')) {
    // Livereload URLs come if you have `npm run start` on while testing
    return request.respond({ status: 200 });
  }
}

// after page load request interceptor
// function postLoadRequestHandler(request) {
//   const url = request.url();
//   console.log(url);
// }

function popupRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(popupInitialPage)) {
    return request.respond({ body: popupHtmlContent });
  } else if (url.includes('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (
    url.startsWith(
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/submit'
    ) ||
    url.startsWith('https://walletapi.mobikwik.com/wallet')
  ) {
    const postData = request.postData();
    if (postData.includes('success=F')) {
      var failureMock = callback.replace(
        '// Callback data //',
        '{"error":{"code":"BAD_REQUEST_ERROR","description":"The payment has already been processed","source":"internal","step":"payment_authorization","reason":"bank_technical_error","metadata":{}},"http_status_code":400,"org_logo":"","org_name":"Razorpay Software Private Ltd","checkout_logo":"https://dashboard-activation.s3.amazonaws.com/org_100000razorpay/checkout_logo/phpnHMpJe","custom_branding":false};'
      );
      return request.respond({ contentType: 'text/html', body: failureMock });
    } else {
      var successMock = callback.replace(
        '// Callback data //',
        "{ razorpay_payment_id: 'pay_123465' }"
      );
      return request.respond({ contentType: 'text/html', body: successMock });
    }
  } else if (url === otpBundle) {
    return request.respond({ body: otpPageBundle });
  } else if (checkoutRequestHandler(request)) {
    return;
  } else {
    request.continue();
  }
}

let interceptorOptions;
module.exports = async ({ page, mockPaymentRequest = false, data = {} }) => {
  if (interceptorOptions) {
    interceptorOptions.disableInterceptor();
  } else {
    await page.setRequestInterception(true);
  }

  page.on('request', checkoutRequestHandler);
  if (mockPaymentRequest) {
    await page.evaluateOnNewDocument(() => {
      class PaymentRequestMock {
        constructor() {}

        canMakePayment() {
          return Promise.resolve(true);
        }
      }

      window.microapps = {
        requestPayment: PaymentRequestMock,
      };

      window.PaymentRequest = PaymentRequestMock;
    });
  }
  await page.goto(customCheckout);

  interceptorOptions = interceptor(page);
  interceptorOptions.enableInterceptor();

  const pageTarget = page.target();

  const returnObj = {
    page,
    data,
    ...interceptorOptions,
    async popup() {
      const target = await page
        .browser()
        .waitForTarget(t => t.opener() === pageTarget);
      const popupPage = await target.page();
      await popupPage.setRequestInterception(true);
      popupPage.on('request', popupRequestHandler.bind(data));
      popupPage.goto(popupInitialPage);
      return {
        page: popupPage,
        async callback(response) {
          await popupPage.evaluate(async () => {
            try {
              window.opener.onComplete(response);
            } catch (e) {}
            try {
              (window.opener || window.parent).postMessage(data, '*');
            } catch (e) {}
            setTimeout(close, 999);
          });
        },
      };
    },
    async callbackPage() {
      const req = await interceptorOptions.expectRequest();
      expect(req.raw.isNavigationRequest()).toBe(true);
      expect(req.method).toBe('POST');
    },
  };
  // page takes some time to render
  await delay(200);
  return returnObj;
};
