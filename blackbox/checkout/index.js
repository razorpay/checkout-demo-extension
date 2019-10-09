const { readFileSync } = require('fs');
const { cdnUrl, lumberjackUrl } = require('../const');
const { interceptor } = require('../util');
const { sendPreferences } = require('../actions/preferences');

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
  switch (url) {
    case checkoutPublic:
      return request.respond({ body: htmlContent });
    case checkoutCss:
      return request.respond({ body: cssContent });
    case checkoutJs:
      return request.respond({ body: jsContent });
    case checkoutFont:
      return request.respond({
        body: fontContent,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    default:
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
  if (url.startsWith('data')) {
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

async function passOptions({ page, options }) {
  await passMessage(page, { options });
}

let interceptorOptions;
module.exports = {
  async openCheckout({ page, options, preferences }) {
    if (interceptorOptions) {
      // turn off the interceptor
      interceptorOptions.toggle();
      page.removeListener('request', cdnRequestHandler);
    } else {
      await page.setRequestInterception(true);
    }

    page.on('request', checkoutRequestHandler);
    await page.goto(checkoutPublic);
    page.removeListener('request', checkoutRequestHandler);
    page.on('request', cdnRequestHandler);

    if (interceptorOptions) {
      // turn on interceptor
      interceptorOptions.toggle();
    } else {
      interceptorOptions = interceptor(page);
    }

    const returnObj = {
      page,
      options,
      preferences,
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
    };

    if (options) await passOptions(returnObj);
    if (preferences) await sendPreferences(returnObj);

    return returnObj;
  },

  cdnUrl,
};
