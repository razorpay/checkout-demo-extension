const path = require('path');
const URL = require('url');
const querystring = require('querystring');

const {
  testDir,
  cdnUrl,
  lumberjackUrl,
  zestMoneyLoanAgreementUrl,
  maxmindScriptUrl,
} = require('./const');

const chrup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const chrlow = 'abcdefghijklmnopqrstuvwxyz';
const chrnum = '0123456789';
const chrsp = '!@#$%^&*()';

const randomRange = (min, max) =>
  min + Math.floor((1 + max - min) * Math.random());
const randomString = set => (length = 14) =>
  Array.apply(null, { length })
    .map(_ => randomItem(set))
    .join('');

const randomLengthString = set => (min = 3, max = 8) =>
  Array.apply(null, { length: module.exports.randomRange(min, max) })
    .map(_ => randomItem(chrlow))
    .join('');

const randomItem = set => set[randomRange(0, set.length - 1)];

const randomEmail = () => {
  const randomFunc = randomLengthString(chrlow);
  return randomFunc(6, 12) + '@' + randomFunc(3, 8) + '.' + randomFunc(2, 3);
};

const randomName = () => {
  return (
    randomItem(chrup) +
    randomString(chrlow)(4, 12) +
    ' ' +
    randomItem(chrup) +
    randomString(chrlow)(4, 12)
  );
};

const util = (module.exports = {
  /**
   * Sets the state in context
   */
  setState: function(context, what = {}) {
    if (!context.state) {
      context.state = {};
    }

    let state = {
      ...context.state,
      ...what,
    };

    context.state = state;
  },

  /**
   * Get the textContent of an element
   * @param {string | ElementHandle} selectorOrElem
   *
   * @returns {string | undefined}
   */
  innerText: async function(selectorOrElem) {
    if (typeof selectorOrElem === 'string') {
      return await page.$eval(selectorOrElem, el => el.textContent);
    }

    try {
      return await page.evaluate(
        element => element.textContent,
        selectorOrElem
      );
    } catch (err) {
      return undefined;
    }
  },

  /**
   * Get the value of an attribute on an element
   * @param {Page} page
   * @param {Element} element
   * @param {String} attribute
   */
  getAttribute: async function(page, element, attribute) {
    try {
      return await page.evaluate(
        (element, attribute) => element.getAttribute(attribute),
        element,
        attribute
      );
    } catch (err) {
      return undefined;
    }
  },

  /**
   * Array.find, but with async support
   * @param {Array} array
   * @param {Function} evaluator
   */
  find: async function(array, evaluator) {
    const promises = array.map(evaluator);

    const results = await Promise.all(promises);

    const index = results.findIndex(Boolean);

    return array[index];
  },

  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

  visible: el => Boolean(el.offsetWidth),
  assertVisible: async sel => {
    expect(
      await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (!el) {
          throw `Element ${sel} is not present`;
        }
        return el.offsetWidth;
      }, sel)
    ).toBeGreaterThan(0);
  },

  chrlow,
  chrup,
  chrnum,
  chrsp,
  randomRange,
  randomName,
  randomEmail,
  randomName,
  randomContact: () => '+91' + String(randomRange(8000000000, 9999999999)),
  randomString,
  randomLengthString,
  randomId: randomString(chrlow + chrup + chrnum),
  randomBool: () => randomItem([true, false]),
  randomItem,

  /**
   * @param  {Page} puppeteer page to intercept requests on
   * @param  {RegExp} optional url pattern to match interceptor against
   * @return {Object} containg operations to perform on intercepted request
   */
  interceptor(page, pattern) {
    let interceptorEnabled = true;
    let resolver;
    let currentRequest = null;

    const returnObj = {
      disableInterceptor: () => (interceptorEnabled = null),
      enableInterceptor: () => (interceptorEnabled = true),
    };

    function shouldIgnore(interceptedRequest) {
      const url = interceptedRequest.url();
      const ignoredUrl =
        !interceptorEnabled ||
        url.endsWith('favicon.ico') ||
        url.startsWith('data') ||
        url.startsWith(cdnUrl) ||
        url.startsWith(lumberjackUrl) ||
        url.includes(zestMoneyLoanAgreementUrl) ||
        url.includes(maxmindScriptUrl);
      if (ignoredUrl || (pattern && !pattern.test(url))) {
        return true;
      }
    }

    page.on('request', interceptedRequest => {
      if (shouldIgnore(interceptedRequest)) {
        return;
      }
      expect(currentRequest).toBeNull();
      currentRequest = interceptedRequest;
      resolver && resolver(currentRequest);
    });

    async function waitForRequest() {
      if (currentRequest) {
        return Promise.resolve(currentRequest);
      } else {
        return new Promise(resolve => (resolver = resolve));
      }
    }

    function reset() {
      currentRequest = resolver = null;
    }

    async function respond(response) {
      await waitForRequest();
      currentRequest.respond(response);
      reset();
    }

    returnObj.expectRequest = async () => {
      await waitForRequest();
      const url = currentRequest.url();
      const parsedURL = URL.parse(url);
      return {
        headers: currentRequest.headers(),
        method: currentRequest.method(),
        body: currentRequest.postData(),
        url,
        URL: parsedURL,
        params: querystring.parse(parsedURL.query),
        raw: currentRequest,
      };
    };

    returnObj.respondPlain = body => respond({ body });

    returnObj.respondJSON = body =>
      respond({
        contentType: 'application/json',
        body: JSON.stringify(body),
      });

    returnObj.respondJSONP = body =>
      respond({
        contentType: 'text/javascript; charset=UTF-8',
        body: `Razorpay.jsonp0(${JSON.stringify(body)})`,
      });

    returnObj.respondHTML = body =>
      respond({
        contentType: 'text/html',
        body,
      });

    returnObj.respondImage = body =>
      respond({
        contentType: 'image/png',
        body,
      });

    returnObj.failRequest = body =>
      respond({
        status: 400,
        body: JSON.stringify(body),
      });

    return returnObj;
  },
});
