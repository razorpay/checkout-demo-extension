const path = require('path');
const URL = require('url');
const querystring = require('querystring');

const {
  cdnUrl,
  bundleUrl,
  lumberjackUrl,
  lumerjackVajraURL,
  zestMoneyLoanAgreementUrl,
} = require('./const');

const chrup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const chrlow = 'abcdefghijklmnopqrstuvwxyz';
const chrnum = '0123456789';
const chrsp = '!@#$%^&*()';

/**
 * Flattens the object by turning nested object into object with delimiters in the keys
 * @param {Object} o
 * @param {string} prefix [prefix='']
 *
 * @returns {Object}
 */
const flatten = (o, prefix = '') => {
  const result = {};
  Object.entries(o).forEach(([key, val]) => {
    const flattenedKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      Object.assign(result, flatten(val, flattenedKey));
    } else {
      result[flattenedKey] = val;
    }
  });
  return result;
};

const randomRange = (min, max) =>
  min + Math.floor((1 + max - min) * Math.random());
const randomString =
  (set) =>
  (length = 14) =>
    Array.apply(null, { length })
      .map((_) => randomItem(set))
      .join('');

const randomLengthString =
  (set) =>
  (min = 3, max = 8) =>
    Array.apply(null, { length: module.exports.randomRange(min, max) })
      .map((_) => randomItem(chrlow))
      .join('');

const randomItem = (set) => set[randomRange(0, set.length - 1)];

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
const getElementForSelector = async (page, selector) => {
  return (await page.$(selector)) || undefined;
};

const query2obj = (string) => {
  // TODO: Support objects and nested objects.

  var obj = {};
  string.split(/=|&/).forEach((param, index, array) => {
    if (index % 2) {
      const key = array[index - 1];
      obj[decodeURIComponent(key)] = decodeURIComponent(param);
    }
  });
  return obj;
};

const unflatten = (o) => {
  const delimiter = '.';
  let result = {};

  Object.entries(o).forEach(([key, val]) => {
    // Remove square brackets and replace them with delimiter.
    key = key.replace(/\[([^[\]]+)\]/g, `${delimiter}$1`);

    const keys = key.split(delimiter);
    let _r = result;

    keys.forEach((k, i) => {
      /**
       * For all keys except the last, create objects and set to _r.
       * For the last key, set the value in _r.
       */
      if (i < keys.length - 1) {
        if (!_r[k]) {
          _r[k] = {};
        }

        _r = _r[k];
      } else {
        _r[k] = val;
      }
    });
  });

  return result;
};

const util = (module.exports = {
  unflatten,
  query2obj,
  /**
   * Sets the state in context
   */
  setState: function (context, what = {}) {
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
  innerText: async function (selectorOrElem) {
    if (typeof selectorOrElem === 'string') {
      return await page.$eval(selectorOrElem, (el) => el.textContent);
    }

    try {
      return await page.evaluate(
        (element) => element.textContent,
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
  getAttribute: async function (page, element, attribute) {
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
  find: async function (array, evaluator) {
    const promises = array.map(evaluator);

    const results = await Promise.all(promises);

    const index = results.findIndex(Boolean);

    return array[index];
  },

  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  visible: (el) => Boolean(el.offsetWidth),
  assertVisible: async (sel) => {
    expect(
      await page.evaluate((sel) => {
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
  flatten,
  randomRange,
  randomName,
  randomEmail,
  randomContact: () => String(randomRange(8000000000, 9999999999)),
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

    let allRequests = {};

    const returnObj = {
      disableInterceptor: () => (interceptorEnabled = null),
      enableInterceptor: () => (interceptorEnabled = true),
      getRequest: (url) => {
        if (url) {
          currentRequest = allRequests[url];
        }
        return currentRequest;
      },
      resetAllRequest: () => {
        allRequests = {};
        reset();
      },
    };

    function getRequestPath(request) {
      if (!request) return '';
      const parsedURL = URL.parse(request.url());
      return parsedURL.pathname;
    }

    function shouldIgnore(interceptedRequest) {
      const url = interceptedRequest.url();
      const ignoredUrl =
        !interceptorEnabled ||
        url.endsWith('favicon.ico') ||
        url.startsWith('data') ||
        (url.startsWith(cdnUrl) && !url.startsWith(bundleUrl)) || // Bundles are present on CDN, but need to be intercepted.
        url.startsWith(lumberjackUrl) ||
        url.startsWith(lumerjackVajraURL) ||
        url.includes(zestMoneyLoanAgreementUrl) ||
        url.includes('html2pdf.bundle.js');
      if (ignoredUrl || (pattern && !pattern.test(url))) {
        return true;
      }
    }

    page.on('request', (interceptedRequest) => {
      if (shouldIgnore(interceptedRequest)) {
        return;
      }
      const urlPath = getRequestPath(interceptedRequest);

      expect(allRequests[urlPath]).toBeFalsy();
      currentRequest = interceptedRequest;
      allRequests[urlPath] = interceptedRequest;
      resolver && resolver(currentRequest);
    });

    async function waitForRequest() {
      if (currentRequest) {
        return Promise.resolve(currentRequest);
      } else {
        return new Promise((resolve) => (resolver = resolve));
      }
    }

    function reset() {
      const urlPath = getRequestPath(currentRequest);
      delete allRequests[urlPath];
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

    returnObj.respondPlain = (body) => respond({ body });

    returnObj.respondJSON = (body, status = 200) =>
      respond({
        contentType: 'application/json',
        body: JSON.stringify(body),
        status,
      });

    returnObj.respondJSONP = (body) => {
      const url = currentRequest.url();
      const parsedURL = URL.parse(url);
      const params = querystring.parse(parsedURL.query);

      return respond({
        contentType: 'text/javascript; charset=UTF-8',
        body: `${params.callback}(${JSON.stringify(body)})`,
      });
    };

    returnObj.respondHTML = (body) =>
      respond({
        contentType: 'text/html',
        body,
      });

    returnObj.respondImage = (body) =>
      respond({
        contentType: 'image/png',
        body,
      });

    returnObj.failRequest = (body) =>
      respond({
        status: 400,
        body: JSON.stringify(body),
      });

    return returnObj;
  },
  getInnerText: async (page, selector) => {
    const elementForSelector = await getElementForSelector(page, selector);
    try {
      if (elementForSelector) {
        return (
          (await elementForSelector.evaluate((element) => {
            return element.innerText;
          })) || ''
        );
      }
    } catch {
      return '';
    }
  },
});
