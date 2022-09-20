const { interceptor } = require('../../util');
const { readFileSync } = require('fs');
const devices = require('puppeteer/DeviceDescriptors');
const { rudderstackStageUrl } = require('../../const');

const prefix = 'https://api-custom.razorpay.com/v1/checkout';
const apiPrefix = 'https://api.razorpay.com/v1/checkout';
const customCheckout = `${prefix}/custom`;
const callbackURL = `${prefix}/callback_response`;
const popupInitialPage = `${prefix}/mockup`;
const razorpayJS = `${prefix}/dist/v1/razorpay.js`;
const otpBundle = 'https://cdn.razorpay.com/static/otp/bundle.js';
const redirectPage = 'v1/payments/create/checkout';
const mockPageSubmit =
  'https://api.razorpay.com/v1/gateway/mocksharp/payment/submit';
const mockSubmitPageCardlessEMI = 'https://api.razorpay.com/v1/otp/verify';

const walletTopUpURL = 'https://walletapi.mobikwik.com/wallet';

const jsContent = readFileSync('app/dist/v1/razorpay.js');
const htmlContent = readFileSync('app/razorpay.test.html');
const popupHtmlContent = readFileSync('blackbox/fixtures/mockSFPage.html');
const otpPageBundle = readFileSync('blackbox/fixtures/otpbundle.js');
const redirectingCallbackPage = readFileSync(
  'blackbox/fixtures/mockRedirectCallback.html',
  {
    encoding: 'utf8',
    flag: 'r',
  }
);
const callback = readFileSync('blackbox/fixtures/callback.html', {
  encoding: 'utf8',
  flag: 'r',
});

/**
 * forceTargetInitialization its hack to detect popup created. There is issue in popup detection with window.open("")
 * https://github.com/puppeteer/puppeteer/issues/2810
 * @param {BrowserContext} browser
 */
function forceTargetInitialization(browser) {
  Array.from(browser._targets.values()).forEach((t, i) => {
    if (!t._isInitialized) {
      browser._targetInfoChanged({
        targetInfo: { ...t._targetInfo, url: ' ' },
      });
    }
  });
}

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
  } else if (url.startsWith(rudderstackStageUrl)) {
    return request.respond({ status: 200 });
  } else if (url.startsWith('data')) {
    return;
  } else if (url.includes('livereload')) {
    // Livereload URLs come if you have `npm run start` on while testing
    return request.respond({ status: 200 });
  } else if (
    url.includes(redirectPage) ||
    url.startsWith(walletTopUpURL) ||
    url.startsWith(mockSubmitPageCardlessEMI)
  ) {
    return request.respond({ body: popupHtmlContent });
  } else if (url.startsWith(mockPageSubmit)) {
    const postData = request.postData();
    let responsePage = redirectingCallbackPage;
    if (postData.includes('success=F')) {
      responsePage = responsePage.replace(
        'document.forms[0].submit()',
        'document.forms[1].submit()'
      );
    }
    return request.respond({
      contentType: 'text/html',
      body: responsePage.replace(/{{callback_url}}/gi, callbackURL),
    });
  } else if (url.includes(callbackURL)) {
    return request.respond({
      contentType: 'text/html',
      body: `<h1>${request.postData()}</h1>`,
    });
  }
}

// after page load request interceptor
// function postLoadRequestHandler(request) {
//   const url = request.url();
// }

function popupRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(popupInitialPage)) {
    return request.respond({ body: popupHtmlContent });
  } else if (url.includes('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (url.startsWith(mockPageSubmit) || url.startsWith(walletTopUpURL)) {
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
  } else if (url.startsWith(callbackURL)) {
  } else if (checkoutRequestHandler(request)) {
    return;
  } else {
    request.continue();
  }
}

let interceptorOptions;
module.exports = async ({
  page,
  mockPaymentRequest = false,
  isCallbackURL = false,
  data = {},
  emulate,
}) => {
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

        show() {
          return Promise.resolve({
            details: {
              txnId: 123456,
              transactionReferenceId: 1234,
            },
            complete: () => null,
          });
        }
      }

      window.microapps = {
        requestPayment: PaymentRequestMock,
      };

      window.PaymentRequest = PaymentRequestMock;
    });
  }
  if (emulate) {
    await page.emulate(devices[emulate]);
  }
  await page.goto(customCheckout);

  interceptorOptions = interceptor(page);
  interceptorOptions.enableInterceptor();

  const pageTarget = page.target();

  // initialize Razorpay Instance
  await page.evaluate(
    async (config = {}) => {
      const { isCallbackURL, callbackURL: callback_url } = config;
      const rzp = {
        key: 'rzp_test_1DP5mmOlF5G5ag',
      };
      if (isCallbackURL) {
        rzp.redirect = true;
        rzp.callback_url = callback_url;
      }
      window.rp = new Razorpay(rzp)
        .on('payment.error', function (resp) {
          document.getElementById('status').innerText = 'failed';
          document.getElementById('response').innerText = JSON.stringify(resp);
        })
        .on('payment.success', function (resp) {
          document.getElementById('status').innerText = 'success';
          document.getElementById('response').innerText = JSON.stringify(resp);
        });
    },
    { isCallbackURL, callbackURL }
  );

  const returnObj = {
    page,
    data,
    ...interceptorOptions,
    forceTargetInitialization,
    async popup() {
      const target = await page
        .browser()
        .waitForTarget((t) => t.opener() === pageTarget);
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
