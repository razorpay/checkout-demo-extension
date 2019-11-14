const querystring = require('querystring');
const { readFileSync } = require('fs');
const { cdnUrl, lumberjackUrl } = require('../const');
const { interceptor } = require('../util');
const { computed } = require('../actions/options');
const { sendPreferences } = require('../actions/preferences');
testCount = 0;

const checkoutPublic = 'https://api.razorpay.com/v1/checkout/public';
const checkoutCss = 'https://checkout.razorpay.com/v1/css/checkout.css';
const checkoutFont = cdnUrl + 'lato.woff2';
const checkoutJs = 'https://checkout.razorpay.com/v1/checkout-frame.js';

const htmlContent = readFileSync('blackbox/fixtures/checkout-public.html');
const jsContent = readFileSync('app/dist/v1/checkout-frame.js');
const cssContent = readFileSync('app/dist/v1/css/checkout.css');
const fontContent = readFileSync('app/fonts/lato.woff2');

function checkoutRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(checkoutPublic)) {
    return request.respond({ body: htmlContent });
  } else if (url.endsWith('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (url === checkoutCss) {
    return request.respond({ body: cssContent });
  } else if (url === checkoutJs) {
    return request.respond({ body: jsContent });
  } else if (url === checkoutFont) {
    return request.respond({
      body: fontContent,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } else {
    throw new Error(
      `unexpected resource URL while loading checkout-public: ${url}`
    );
  }
}

/**
 * @param  {Request} puppeteer intercepted request
 */
function cdnRequestHandler(request) {
  const url = request.url();
  if (url.endsWith('favicon.ico')) {
    request.respond({ status: 204 });
  } else if (url.startsWith('data')) {
    request.respond({ body: url });
  } else if (url.startsWith(lumberjackUrl)) {
    request.respond({ status: 204 });
  } else if (url.startsWith(cdnUrl)) {
    const localPath = 'app/images/' + url.slice(cdnUrl.length);
    try {
      request.respond({ body: readFileSync(localPath) });
    } catch (e) {
      if (e.code === 'ENOENT') {
        // console.warn('404: ' + e.path);
        request.respond({ status: 404 });
      } else {
        console.error(e);
        request.respond({ status: 500 });
      }
    }
  }
}

async function passMessage(page, message) {
  await page.evaluate(message => handleMessage(message), message);
}

let interceptorOptions;
module.exports = {
  async openCheckout({ page, options, preferences, params, apps }) {
    let checkoutUrl = checkoutPublic;
    if (params) checkoutUrl += '?' + querystring.stringify(params);
    if (interceptorOptions) {
      interceptorOptions.disableInterceptor();
      page.removeListener('request', cdnRequestHandler);
    } else {
      await page.setRequestInterception(true);
    }

    page.on('request', checkoutRequestHandler);
    await page.goto(checkoutUrl);
    page.removeListener('request', checkoutRequestHandler);
    page.on('request', cdnRequestHandler);

    if (interceptorOptions) {
      interceptorOptions.enableInterceptor();
    } else {
      interceptorOptions = interceptor(page);
    }

    const returnObj = {
      page,
      testCount,
      options,
      preferences,
      ...computed(options, preferences),
      ...interceptorOptions,
      popup() {
        const targets = page.browserContext().targets();
        switch (targets.length) {
          case 1:
            throw new Error('No popup is open');
          default:
            return targets[targets.length - 1];
        }
      },
      async callbackPage(response) {
        const req = await interceptorOptions.expectRequest();
        expect(req.raw.isNavigationRequest()).toBe(true);
        expect(req.method).toBe('POST');
      },
    };

    if (options) {
      const message = { options };
      if (apps) message.upi_intents_data = apps;
      await passMessage(page, message);
    }
    if (preferences) await sendPreferences(returnObj);

    return returnObj;
  },

  cdnUrl,
};
