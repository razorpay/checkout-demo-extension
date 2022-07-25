/**
 * independent service to track error
 */
const { readFileSync } = require('fs');
const { interceptor } = require('../../util');

const merchantWebsite = 'https://test.com/';
const checkoutJs = 'https://checkout.razorpay.com/v1/checkout.js';
const checkoutFrameJs = 'https://checkout.razorpay.com/v1/checkout-frame.js';
const checkoutJsContent = readFileSync('app/dist/v1/checkout.js', {
  encoding: 'utf8',
  flag: 'r',
});
const jsContent = readFileSync('app/dist/v1/checkout-frame.js');
const cssContent = readFileSync('app/dist/v1/css/checkout.css');
const fontContent = readFileSync('app/fonts/lato.woff2');
const checkoutFont = 'lato.woff2';
const merchantHtmlContent = readFileSync(
  'blackbox/fixtures/merchant-mock.html'
);
const publicHtmlContent = readFileSync(
  'blackbox/fixtures/checkout-public.html'
);

function merchantIntegrationRequest(
  request,
  isErrorOnMerchantWebsite = false,
  isErrorOnCheckoutJS = false
) {
  const url = request.url();
  if (url === merchantWebsite) {
    return request.respond({
      body: merchantHtmlContent,
    });
  } else if (url.startsWith('https://api.razorpay.com/v1/checkout/public')) {
    return request.respond({
      body: publicHtmlContent,
    });
  } else if (url.endsWith('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (url.endsWith('checkout.css')) {
    return request.respond({ body: cssContent });
  } else if (url === checkoutFrameJs) {
    return request.respond({ body: jsContent });
  } else if (url === checkoutJs) {
    return request.respond({
      body: checkoutJsContent.replaceAll('__S_TRAFFIC_ENV__', 'prod').concat(
        isErrorOnCheckoutJS
          ? `
        function error() {
          throw new Error('Error trigger from checkout.js');
        }
        setTimeout(error, 1000);
      `
          : ''
      ),
    });
  } else if (url.endsWith(checkoutFont)) {
    return request.respond({
      body: fontContent,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } else if (url.startsWith('data')) {
    return;
  } else if (url.includes('livereload.js')) {
    return request.respond({
      status: 200,
      body: isErrorOnMerchantWebsite ? `throw new Error('hello world')` : '',
    });
  } else {
    throw new Error(
      `unexpected resource URL while loading checkout-public: ${url}`
    );
  }
}

describe('CFU Error Service', () => {
  afterEach(async () => {
    page.removeAllListeners('request');
    await page.setRequestInterception(false);
  });
  test('merchant website error should not track', async () => {
    page.on('request', function (req) {
      const url = req.url();
      if (url.startsWith('https://lumberjack.razorpay.com')) {
        throw new Error(
          'no lumberjack request should trigger for third party error'
        );
      }
      merchantIntegrationRequest(req, true);
    });
    await page.setRequestInterception(true);
    await page.goto(merchantWebsite);
  });

  test('tracking checkout.js error', async () => {
    page.on('request', function (req) {
      const url = req.url();
      if (
        url.startsWith('https://lumberjack.razorpay.com') ||
        url.startsWith('https://lumberjack-metrics.razorpay.com/')
      ) {
        return request.respond({ status: 200 });
      }
      merchantIntegrationRequest(req, false, true);
    });
    const interceptorRequest = interceptor(page);
    interceptorRequest.enableInterceptor();
    await page.setRequestInterception(true);
    await page.goto(merchantWebsite);
  });
});
