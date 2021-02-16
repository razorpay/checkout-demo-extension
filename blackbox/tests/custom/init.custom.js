const { interceptor } = require('../../util');
const { callbackHtml } = require('../../actions/callback.js');
const { readFileSync } = require('fs');
const API = require('./mockApi');

const prefix = 'https://api.razorpay.in/v1/checkout';

const customCheckout = `${prefix}/custom`;
const config = `${prefix}/config.js`;
const razorpayJS = `${prefix}/js/generated/entry/razorpay.js`;

const popupCallbackRequest =
  'https://api.razorpay.com/v1/payments/pay_GZ7c6a2d9mfWAG';

const jsContent = readFileSync('app/js/generated/entry/razorpay.js');
const configContent = readFileSync('app/config.js');
const htmlContent = readFileSync('app/razorpay.test.html');

function checkoutRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(customCheckout)) {
    return request.respond({ body: htmlContent });
  } else if (url.startsWith(config)) {
    return request.respond({ body: configContent });
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
  } else if (url.includes('create/ajax')) {
    request.continue({
      url: 'https://api-web.func.razorpay.in/v1/payments/create/ajax',
    });

    // request.respond({
    //   content: 'application/json',
    //   headers: { 'Access-Control-Allow-Origin': '*' },
    //   body: JSON.stringify(API.ajaxResponse),
    // });
  }
  //  else {
  //   request.continue();
  // }
}

// after page load request interceptor
// function postLoadRequestHandler(request) {
//   const url = request.url();
//   console.log(url);
// }

function popupRequestHandler(request) {
  const url = request.url();
  console.log('amigo', url);
  if (
    url.startsWith(
      'https://api.razorpay.com/v1/gateway/mocksharp/payment/submit'
    )
  ) {
    console.log(request.postData());
  } else {
  }
  request.continue();
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
      //   await popupPage.setRequestInterception(true);
      //   popupPage.on('request', popupRequestHandler.bind(data));
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
