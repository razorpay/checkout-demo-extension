const sessionIdHeader = 'X-Razorpay-SessionId';
const trackIdHeader = 'X-Razorpay-TrackId';
const Xhr = XMLHttpRequest;
import * as _ from './_';
import * as _El from './_El';
import * as _Obj from './_Obj';
const networkError = _.rzpError('Network error');
let jsonp_cb = 0;
let sessionId, trackId, keylessHeader;

/**
 * this param will be used in fetch.prototype.till to avoid subsequent poll requests
 *
 */
let pausePolling = false;
let pollDelayBy = 0;

function pausePoll() {
  if (!pausePolling) {
    pausePolling = true;
  }
}

/**
 * Reset the polling delay if any
 * Resume the polling if its paused
 */
function resumePoll() {
  if (pausePolling) {
    pausePolling = false;
  }
  setPollDelayBy(0);
}

/**
 *
 * @param {number} xTimes
 */
function setPollDelayBy(xTimes) {
  if (isNaN(xTimes)) {
    return;
  }
  pollDelayBy = +xTimes;
}
/**
 * This function is used to reset the poll pause/resume before creating a new request
 * @param  {...any} args
 * @returns
 */
function resetPoll(...args) {
  resumePoll();
  if (this) {
    return this(...args);
  }
  return null;
}

/**
 * Sets the session ID.
 * @param {string} id
 *
 * @returns {void}
 */
function setSessionId(id) {
  sessionId = id;
}

/**
 * Sets the track ID.
 * @param {string} id
 *
 * @returns {void}
 */
function setTrackId(id) {
  trackId = id;
}

/**
 * Sets the keyless header.
 * @param {string} id
 *
 * @returns {void}
 */
function setKeylessHeader(id) {
  keylessHeader = id;
}

/**
 * Appends the query parameter to url when passed
 * @param {string} url
 * @param {string} paramName
 * * @param {string} paramValue
 *
 * @returns {string}
 */
function appendQueryParamToUrl(url, paramName, paramValue) {
  if (!paramName || !paramValue) {
    return url;
  }

  return _.appendParamsToUrl(
    url,
    _.obj2query({
      [paramName]: paramValue,
    })
  );
}

/**
 * Appends the keyless header query parameter to url when present
 * @param {string} url
 * @param {string} keylessHeader
 *
 * @returns {string}
 */
function appendKeylessHeaderParamToUrl(url, keylessHeader) {
  return appendQueryParamToUrl(url, 'keyless_header', keylessHeader);
}

/**
 * Sends a fetch request with the given options
 * @param {Object} options
 *
 * @returns {Object}
 */
export default function fetch(options) {
  if (!_.is(this, fetch)) {
    return new fetch(options);
  }

  this.options = normalizeOptions(options);
  this.defer();
}

const fetchPrototype = {
  setReq: function (type, value) {
    this.abort();
    this.type = type;
    this.req = value;
    return this;
  },

  till: function (continueUntilFn, retryLimit = 0, frequency = 3e3) {
    if (pausePolling) {
      setTimeout(() => {
        this.till(continueUntilFn, retryLimit, frequency);
      }, frequency);
      return;
    }
    /**
     * Do Not Pass `nextReqFrequency` to `till` function, as that gets compounded in each call
     */
    const nextReqFrequency = pollDelayBy ? pollDelayBy * frequency : frequency;
    return this.setReq(
      'timeout',
      setTimeout(() => {
        this.call((response) => {
          // If there is an error, retry again until retry limit.
          if (response.error && retryLimit > 0) {
            this.till(continueUntilFn, retryLimit - 1, frequency);
          } else if (continueUntilFn(response)) {
            this.till(continueUntilFn, retryLimit, frequency);
          } else {
            this.options.callback(response);
          }
        });
      }, nextReqFrequency)
    );
  },

  abort: function () {
    // this.req, which may be XMLHttpRequest object, setTimeout ID
    // or jsonp callback counter
    let { req, type } = this;

    // return if already null
    if (!req) {
      return;
    }

    if (type === 'ajax') {
      this.req.abort();
    } else if (type === 'jsonp') {
      global.Razorpay[this.req] = (_) => _;
    } else {
      clearTimeout(this.req);
    }
    this.req = null;
  },

  defer: function () {
    this.req = setTimeout(() => this.call());
  },

  call: function (callback = this.options.callback) {
    var { url, method, data, headers } = this.options;

    //#region DDoS Protection
    /**
     * These values are added in the query parameter to protect against DDoS. Edge gives
     * some token to checkout after validating a user. Checkout then sends back these
     * values attached with every network request because Edge will only let the
     * network request pass through which has valid token and reject others
     * with status code 401.
     *
     * keyless_header : an encrypted value is added to the serverside rendered pages like
     *                  payment links, payment pages etc. This value is then passed to
     *                  checkout via checkout options. This is then passed here.
     *
     * Same is repeated below for jsonp reqquests.
     */
    url = appendKeylessHeaderParamToUrl(url, keylessHeader);
    //#endregion

    var xhr = new Xhr();
    this.setReq('ajax', xhr);

    xhr.open(method, url, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status) {
        var json = _Obj.parse(xhr.responseText);
        if (!json) {
          json = _.rzpError('Parsing error');
          json.xhr = {
            status: xhr.status,
            text: xhr.responseText,
          };
        }

        if (json.error) {
          global.dispatchEvent(
            _.CustomEvent('rzp_network_error', {
              detail: {
                method,
                url,
                baseUrl: url.split('?')[0],
                status: xhr.status,
                xhrErrored: false,
                response: json,
              },
            })
          );
        }

        json['status_code'] = xhr.status;

        callback(json);
      }
    };
    xhr.onerror = function () {
      var resp = networkError;
      resp.xhr = {
        status: 0,
      };

      global.dispatchEvent(
        _.CustomEvent('rzp_network_error', {
          detail: {
            method,
            url,
            baseUrl: url.split('?')[0],
            status: 0,
            xhrErrored: true,
            response: resp,
          },
        })
      );

      callback(resp);
    };

    if (sessionId) {
      headers[sessionIdHeader] = sessionId;
    }

    if (trackId) {
      headers[trackIdHeader] = trackId;
    }

    headers |> _Obj.loop((v, k) => xhr.setRequestHeader(k, v));

    xhr.send(data);
  },
};

fetchPrototype.constructor = fetch;
fetch.prototype = fetchPrototype;

function normalizeOptions(options) {
  if (_.isString(options)) {
    options = { url: options };
  }

  var { method, headers, callback, data } = options;

  // set normalized defaults
  if (!headers) {
    options.headers = {};
  }
  if (!method) {
    options.method = 'get';
  }
  if (!callback) {
    options.callback = (_) => _;
  }
  if (_.isNonNullObject(data) && !_.is(data, FormData)) {
    data = _.obj2query(data);
  }
  options.data = data;

  return options;
}

/**
 * Sends post request with the given options.
 * @param {Object} opts
 *
 * @returns {Object}
 */
function post(opts) {
  opts.method = 'post';
  if (!opts.headers) {
    opts.headers = {};
  }
  if (!opts.headers['Content-type']) {
    opts.headers['Content-type'] = 'application/x-www-form-urlencoded';
  }

  return fetch(opts);
}

/**
 * Sends put request with the given options.
 * @param {Object} opts
 *
 * @returns {Object}
 */
function put(opts) {
  opts.method = 'put';
  if (!opts.headers) {
    opts.headers = {};
  }
  if (!opts.headers['Content-type']) {
    opts.headers['Content-type'] = 'application/x-www-form-urlencoded';
  }

  return fetch(opts);
}

/**
 * Sends patch request with the given options.
 * @param {Object} opts
 *
 * @returns {Object}
 */
function patch(opts) {
  opts.method = 'PATCH';
  if (!opts.headers) {
    opts.headers = {};
  }
  if (!opts.headers['Content-type']) {
    opts.headers['Content-type'] = 'application/x-www-form-urlencoded';
  }

  return fetch(opts);
}

/**
 * Sends jsonp request with the given options.
 * @param {Object} options
 *
 * @returns {Object}
 */
function jsonp(options) {
  if (!options.data) {
    options.data = {};
  }

  // callbackIndex is the nth fetch.jsonp call
  const callbackIndex = jsonp_cb++;

  // We need to use attempt numbers to generate unique URLs
  let attemptNumber = 0;

  let request = new fetch(options);
  options = request.options;

  request.call = function (cb = options.callback) {
    // This is the same fetch.jsonp instance. Incrememt the attempt number.
    attemptNumber++;

    const callbackName = `jsonp${callbackIndex}_${attemptNumber}`;

    let done = false;

    const onload = function () {
      if (
        !done &&
        (!this.readyState ||
          this.readyState === 'loaded' ||
          this.readyState === 'complete')
      ) {
        done = true;
        this.onload = this.onreadystatechange = null;
        this |> _El.detach;
      }
    };

    let req = (global.Razorpay[callbackName] = function (data) {
      _Obj.deleteProp(data, 'http_status_code');
      cb(data);
      _Obj.deleteProp(global.Razorpay, callbackName);
    });

    this.setReq('jsonp', req);

    // Make the source URL
    let src = _.appendParamsToUrl(options.url, options.data);

    //#region DDoS Protection
    src = appendKeylessHeaderParamToUrl(src, keylessHeader);
    //#endregion

    // Add callback name to the source URL
    src = _.appendParamsToUrl(
      src,
      _.obj2query({
        callback: `Razorpay.${callbackName}`,
      })
    );

    _El.create('script')
      |> _Obj.extend({
        src,
        async: true,
        onerror: () => cb(networkError),
        onload,
        onreadystatechange: onload,
      })
      |> _El.appendTo(document.documentElement);
  };

  return request;
}

fetch.post = resetPoll.bind(post);
fetch.patch = resetPoll.bind(patch);
fetch.put = resetPoll.bind(put);
fetch.setSessionId = setSessionId;
fetch.setTrackId = setTrackId;
fetch.setKeylessHeader = setKeylessHeader;
fetch.jsonp = resetPoll.bind(jsonp);

fetch.pausePoll = pausePoll;
fetch.resumePoll = resumePoll;
fetch.setPollDelayBy = setPollDelayBy;
