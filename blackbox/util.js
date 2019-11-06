const path = require('path');
const URL = require('url');
const querystring = require('querystring');

const { testDir, cdnUrl, lumberjackUrl } = require('./const');

module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

  visible: el => !!el.getBoundingClientRect().width,

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
        url.startsWith(lumberjackUrl);
      if (ignoredUrl || (pattern && !pattern.test(url))) return true;
    }

    page.on('request', interceptedRequest => {
      if (shouldIgnore(interceptedRequest)) return;
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

    returnObj.respondHTML = body =>
      respond({
        contentType: 'text/html',
        body,
      });

    returnObj.failRequest = body =>
      respond({
        status: 400,
        body: JSON.stringify(body),
      });

    return returnObj;
  },
};
