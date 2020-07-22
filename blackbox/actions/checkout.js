const querystring = require('querystring');
const { readFileSync } = require('fs');
const { cdnUrl, lumberjackUrl, bundleUrl } = require('../const');
const { interceptor } = require('../util');
const { computed } = require('./options');
const { callbackHtml } = require('./callback');
const { sendPreferences } = require('./preferences');
const { setExperiments } = require('./experiments');

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
  } else if (url.startsWith('https://lumberjack.razorpay.com')) {
    return request.respond({ status: 200 });
  } else if (url.startsWith('data')) {
    return;
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
  } else if (url.startsWith(cdnUrl) && !url.startsWith(bundleUrl)) {
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

const API_PREFERRED_INSTRUMENTS = {
  upi: [
    {
      method: 'upi',
      instrument: 'dsd@okhdfcbank',
      score: 1,
    },

    {
      method: 'upi',
      instrument: 'dfs@okicici',
      score: 1,
    },
  ],

  wallet: [
    {
      method: 'wallet',
      instrument: 'freecharge',
      score: 1,
    },
  ],

  netbanking: [
    {
      method: 'netbanking',
      instrument: 'HDFC',
      score: 1,
    },
  ],

  card: [
    {
      method: 'card',
      issuer: 'ICIC',
      network: 'Visa',
      type: 'credit',
      instrument: 'token_9AT28Pxxe0Npi9',
      score: 1,
    },
  ],
};

let interceptorOptions;
module.exports = {
  async openCheckout({
    page,
    options,
    preferences,
    params,
    apps,
    experiments,
    method,
  }) {
    // Disable animations for testing
    options = {
      ...options,
      modal: {
        ...(options.modal || {}),
        animation: false,
      },
    };

    let checkoutUrl = checkoutPublic;
    if (params) {
      checkoutUrl += '?' + querystring.stringify(params);
    }
    if (interceptorOptions) {
      interceptorOptions.disableInterceptor();
      page.removeListener('request', cdnRequestHandler);
    } else {
      await page.setRequestInterception(true);
    }

    page.on('request', checkoutRequestHandler);
    await page.goto(checkoutUrl);

    if (typeof options.personalization === 'undefined') {
      options.personalization = false;
    }

    await setExperiments(page, experiments);
    if (method && options.personalization) {
      await page.evaluate(method => {
        const hashKey = '4d184816';
        var upiInstruments = {};
        var netbankingInstruments = {};
        var qrInstruments = {};
        var cardInstruments = {};
        var walletInstruments = {};
        qrInstruments[hashKey] = [
          {
            '_[flow]': 'intent',
            '_[upiqr]': '1',
            method: 'upi',
            timestamp: 1574079022916,
            success: true,
            frequency: 2,
            id: 'DhnN8SggG8Ihdy',
          },
        ];
        cardInstruments[hashKey] = [
          {
            method: 'card',
            token_id: 'token_9AT28Pxxe0Npi9',
            type: 'credit',
            issuer: 'ICIC',
            network: 'Visa',
            timestamp: 1574056926308,
            success: true,
            frequency: 1,
            id: 'Dhh671dR688OWQ',
          },
        ];
        walletInstruments[hashKey] = [
          {
            wallet: 'freecharge',
            method: 'wallet',
            timestamp: 1574081911355,
            success: true,
            frequency: 1,
            id: 'DhoBzK59KicZni',
          },
        ];
        upiInstruments[hashKey] = [
          {
            '_[flow]': 'directpay',
            vpa: 'dsd@okhdfcbank',
            method: 'upi',
            timestamp: 1574063491481,
            success: true,
            frequency: 2,
            id: 'Dhix6Bqn8w7td4',
          },
          {
            '_[flow]': 'directpay',
            vpa: 'dfs@okicici',
            method: 'upi',
            timestamp: 1574066575053,
            success: true,
            frequency: 1,
            id: 'Dhjpz3w1RIGMJ1',
          },
        ];
        netbankingInstruments[hashKey] = [
          {
            bank: 'HDFC',
            method: 'netbanking',
            timestamp: 1574062745851,
            success: true,
            frequency: 2,
            id: 'Dhh86QTueOpyWX',
          },
        ];
        localStorage.setItem(
          'rzp_preffered_instruments',
          {
            UPI: JSON.stringify(upiInstruments),
            Netbanking: JSON.stringify(netbankingInstruments),
            QR: JSON.stringify(qrInstruments),
            Card: JSON.stringify(cardInstruments),
            Wallet: JSON.stringify(walletInstruments),
          }[method]
        );
      }, method);

      // Set preferred methods in preferences too
      preferences.preferred_methods = {
        '+918888888881': API_PREFERRED_INSTRUMENTS[method.toLowerCase()],
      };
    }

    page.removeListener('request', checkoutRequestHandler);
    page.on('request', cdnRequestHandler);

    if (interceptorOptions) {
      interceptorOptions.enableInterceptor();
    } else {
      interceptorOptions = interceptor(page);
    }

    const pageTarget = page.target();
    const returnObj = {
      page,
      options,
      preferences,
      ...computed(options, preferences),
      ...interceptorOptions,
      async popup() {
        const target = await page
          .browser()
          .waitForTarget(t => t.opener() === pageTarget);
        const popupPage = await target.page();
        return {
          page: popupPage,
          async callback(response) {
            await popupPage.goto(
              'data:text/html,' + encodeURIComponent(callbackHtml(response))
            );
          },
        };
      },
      async callbackPage(response) {
        const req = await interceptorOptions.expectRequest();
        expect(req.raw.isNavigationRequest()).toBe(true);
        expect(req.method).toBe('POST');
      },
    };

    if (options) {
      const message = { options };
      if (apps) {
        if (typeof apps === 'boolean') {
          apps = [
            {
              package_name: 'in.org.npci.upiapp',
              shortcode: 'bhim',
              app_name: 'BHIM',
            },
            {
              package_name: 'some.random.app',
              shortcode: 'some.random.app',
              app_name: 'Some Random App',
            },
          ];
        }

        message.upi_intents_data = apps;
      }
      await passMessage(page, message);
    }
    if (preferences) {
      await sendPreferences(returnObj);
    }
    // page takes some time to render
    await delay(200);
    return returnObj;
  },
  cdnUrl,
};
