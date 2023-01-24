const querystring = require('querystring');
const { readFileSync } = require('fs');
const {
  cdnUrl,
  lumberjackUrl,
  bundleUrl,
  rudderstackStageUrl,
  rudderstackProdUrl,
  lumerjackVajraURL,
} = require('../const');
const { interceptor, delay } = require('../util');
const { computed } = require('./options');
const { callbackHtml, getMockResponse } = require('./callback');
const { sendPreferences, makePreferencesLogged } = require('./preferences');
const { sendRewards, sendRewardsOneCC } = require('./rewards');
const { sendSiftJS } = require('./siftjs');
const { setExperiments } = require('./experiments');
const { handleResetReq } = require('./one-click-checkout/common');
const { handlePartialOrderUpdate } = require('./one-click-checkout/order');
const puppeteer = require('puppeteer');

const checkoutPublic = 'https://api.razorpay.com/v1/checkout/public';
const sentryUrl = 'https://browser.sentry-cdn.com/7.2.0/bundle.min.js';
const automaticCheckoutPublic =
  'https://api.razorpay.com/v1/checkout/public/automatic';
const checkoutCss = 'https://checkout.razorpay.com/v1/css/checkout.css';
const checkoutFont = cdnUrl + 'lato.woff2';
const checkoutFrameJs = 'https://checkout.razorpay.com/v1/checkout-frame.js';
const checkoutJs = 'https://checkout.razorpay.com/v1/checkout.js';
const mockPageSubmit =
  'https://api.razorpay.com/v1/gateway/mocksharp/payment/submit';
const shopifyPreview = 'https://www.shopifypreview.com/';

const htmlContent = readFileSync('blackbox/fixtures/checkout-public.html');
const autoHtmlContent = readFileSync(
  'blackbox/fixtures/automatic-checkout.html'
);
const prefetchPrefsHtmlContent = readFileSync(
  'blackbox/fixtures/1cc-shopify-prefetch-prefs.html'
);
const jsContent = readFileSync('app/dist/v1/checkout-frame.js');
const checkoutJsContent = readFileSync('app/dist/v1/checkout.js');
const cssContent = readFileSync('app/dist/v1/css/checkout.css');
const fontContent = readFileSync('app/fonts/lato.woff2');
const popupHtmlContent = readFileSync('blackbox/fixtures/mockSFPage.html');

function checkoutRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(automaticCheckoutPublic)) {
    return request.respond({ body: autoHtmlContent });
  }
  if (url.startsWith(checkoutPublic)) {
    return request.respond({ body: htmlContent });
  } else if (url.startsWith(shopifyPreview)) {
    return request.respond({ body: prefetchPrefsHtmlContent });
  } else if (url.endsWith('favicon.ico')) {
    return request.respond({ status: 204 });
  } else if (url === checkoutCss) {
    return request.respond({ body: cssContent });
  } else if (url === checkoutFrameJs) {
    return request.respond({ body: jsContent });
  } else if (url === checkoutJs) {
    return request.respond({ body: checkoutJsContent });
  } else if (
    url === checkoutFont ||
    url.startsWith('https://fonts.googleapis.com/css2')
  ) {
    return request.respond({
      body: fontContent,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } else if (
    url.startsWith('https://lumberjack.razorpay.com') ||
    url.includes(sentryUrl) ||
    url.startsWith(lumerjackVajraURL)
  ) {
    return request.respond({ status: 200 });
  } else if (
    url.startsWith(rudderstackStageUrl) ||
    url.startsWith(rudderstackProdUrl) ||
    url.startsWith('https://chart.googleapis.com')
  ) {
    return request.respond({ status: 200 });
  } else if (url.startsWith('data')) {
    return;
  } else if (url.includes('livereload')) {
    // Livereload URLs come if you have `npm run start` on while testing
    return request.respond({ status: 200 });
  } else {
    throw new Error(
      `unexpected resource URL while loading checkout-public: ${url}`
    );
  }
}

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

function popupRequestHandler(request) {
  const url = request.url();
  if (url.startsWith(mockPageSubmit)) {
    const postData = request.postData();
    return request.respond({
      contentType: 'text/html',
      body: getMockResponse(!postData.includes('success=F')),
    });
  } else if (url.includes('v1/gateway/mocksharp/payment')) {
    return request.respond({ body: popupHtmlContent });
  } else {
    request.continue();
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
  } else if (
    url.startsWith(lumberjackUrl) ||
    url.includes('https://browser.sentry-cdn.com/7.2.0/bundle.min.js') ||
    url.startsWith(rudderstackStageUrl) ||
    url.startsWith(rudderstackProdUrl)
  ) {
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
  await page.evaluate((message) => handleMessage(message), message);
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

  app: [
    {
      method: 'app',
      provider: 'cred',
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
    upiApps,
    experiments,
    method,
    emulate,
    withSiftJS,
    networkInterceptorConfig = {},
    personalizationDefault,
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
      interceptorOptions.resetAllRequest();
      page.removeListener('request', cdnRequestHandler);
    } else {
      await page.setRequestInterception(true);
    }

    if (emulate) {
      await page.emulate(puppeteer.devices[emulate]);
    }

    page.on('request', checkoutRequestHandler);
    await page.setDefaultNavigationTimeout(0);
    await page.goto(checkoutUrl);

    if (typeof options.personalization === 'undefined') {
      options.personalization = false;
    }

    if (personalizationDefault) {
      options.personalization = undefined;
    }

    await setExperiments(page, experiments);
    if (preferences.features.one_click_checkout && emulate) {
      await page.evaluate(
        (contactObj) => {
          localStorage.setItem('rzp_contact', JSON.stringify(contactObj));
        },
        {
          contact: '+919999999999',
          email: 'test@gmail.com',
        }
      );
    }
    if (method && options.personalization) {
      await page.evaluate(
        (method, opt) => {
          const hashKey = '4d184816';
          var upiInstruments = {};
          var netbankingInstruments = {};
          var qrInstruments = {};
          var cardInstruments = {};
          var walletInstruments = {};
          var appInstruments = {};
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
              wallet: opt.isPaypalCC ? 'paypal' : 'freecharge',
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
          appInstruments[hashKey] = [
            {
              provider: 'cred',
              method: 'app',
              timestamp: 1574062745851,
              success: true,
              frequency: 2,
              id: 'Dhh86QTueOpTWX',
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
              app: JSON.stringify(appInstruments),
            }[method]
          );
        },
        method,
        options
      );

      // Set preferred methods in preferences too
      preferences.preferred_methods = {
        '+918888888881': {
          instruments: API_PREFERRED_INSTRUMENTS[method.toLowerCase()],
          is_customer_identified: true,
          user_aggregates_available: true,
        },
      };
    }

    page.removeListener('request', checkoutRequestHandler);
    page.on('request', cdnRequestHandler);

    if (interceptorOptions) {
      interceptorOptions.enableInterceptor();
    } else {
      interceptorOptions = interceptor(
        page,
        networkInterceptorConfig.pattern,
        networkInterceptorConfig.ignorePattern
      );
    }

    if (withSiftJS) {
      preferences.features = {
        ...preferences.features,
        enable_sift_js: true,
      };
    }

    const pageTarget = page.target();
    const returnObj = {
      page,
      options,
      preferences,
      isRedesignV15Enabled:
        preferences.features.one_click_checkout ||
        preferences?.experiments?.checkout_redesign_v1_5,
      ...computed(options, preferences),
      ...interceptorOptions,
      forceTargetInitialization,
      async popup() {
        forceTargetInitialization(browser);
        const target = await page
          .browser()
          .waitForTarget((t) => t.opener() === pageTarget);
        const popupPage = await target.page();
        await popupPage.setRequestInterception(true);
        popupPage.on('request', popupRequestHandler);
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
      if (upiApps) {
        if (typeof upiApps === 'boolean') {
          upiApps = [
            {
              package_name: 'in.org.npci.upiapp',
              shortcode: 'bhim',
              app_name: 'BHIM',
            },
            {
              shortcode: 'phonepe',
              app_name: 'Phonepe',
            },
            {
              package_name: 'some.random.app',
              shortcode: 'some.random.app',
              app_name: 'Some Random App',
            },
          ];
        }

        message.upi_intents_data = upiApps;
      }

      if (apps && apps.includes('google_pay')) {
        message.external_sdks = { googlepay: true };
      }

      if (apps && apps.includes('cred')) {
        message.uri_data = [
          {
            shortcode: 'cred',
            package_name: 'com.dreamplug.androidapp',
            uri: 'credpay',
          },
        ];
      }

      await passMessage(page, message);
    }
    if (preferences) {
      await sendPreferences(returnObj);
      if (withSiftJS) {
        await sendSiftJS(returnObj);
      }
      if (preferences.features.one_click_checkout) {
        await delay(200);
        sendRewardsOneCC(returnObj),
          handleResetReq(returnObj, options.order_id),
          handlePartialOrderUpdate(returnObj);
      } else {
        await sendRewards(returnObj);
      }
    }
    // page takes some time to render
    await delay(200);
    return returnObj;
  },
  async openAutoCheckout({ page, preferences }) {
    // Disable animations for testing
    let checkoutUrl = automaticCheckoutPublic;
    if (interceptorOptions) {
      interceptorOptions.disableInterceptor();
      interceptorOptions.resetAllRequest();
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
      preferences,
      ...interceptorOptions,
      sendPreferences,
      sendRewards,
    };
    // page takes some time to render
    await delay(200);
    return returnObj;
  },
  async prefetchPrefsAndOpenCheckout({ page, preferences }) {
    let checkoutUrl = shopifyPreview;
    if (interceptorOptions) {
      interceptorOptions.disableInterceptor();
      interceptorOptions.resetAllRequest();
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
      preferences,
      ...interceptorOptions,
      sendPreferences,
    };
    // page takes some time to render
    await delay(200);
    return returnObj;
  },
  cdnUrl,
};
