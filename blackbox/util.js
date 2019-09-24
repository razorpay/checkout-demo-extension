const path = require('path');
const URL = require('url');
const querystring = require('querystring');

const assert = require('./assert');
const { testDir, cdnUrl, lumberjackUrl } = require('./const');

module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * @param  {Page} puppeteer page to intercept requests on
   * @param  {RegExp} optional url pattern to match interceptor against
   * @return {Object} containg operations to perform on intercepted request
   */
  interceptor(page, pattern) {
    let resolver;
    let currentRequest = null;

    function shouldIgnore(interceptedRequest) {
      const url = interceptedRequest.url();
      const ignoredUrl =
        url.startsWith('data') ||
        url.startsWith(cdnUrl) ||
        url.startsWith(lumberjackUrl);
      if (ignoredUrl || (pattern && !pattern.test(url))) return true;
    }

    page.on('request', interceptedRequest => {
      if (shouldIgnore(interceptedRequest)) return;
      assert.isNull(currentRequest, 'No multiple ongoing requests');
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

    async function expectRequest() {
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
      };
    }

    function reset() {
      currentRequest = resolver = null;
    }

    async function respond(response) {
      await waitForRequest();
      currentRequest.respond(response);
      reset();
    }

    function failRequest(body) {
      return respond({
        status: 400,
        body: JSON.stringify(body),
      });
    }

    function respondJSON(body) {
      return respond({
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    }

    function respondPlain(body) {
      return respond({ body });
    }

    return { expectRequest, respondJSON, respondPlain, failRequest };
  },
};
