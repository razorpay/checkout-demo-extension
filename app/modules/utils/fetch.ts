// TODO make it class
/** Fetch Types */
export type FetchPrototype = {
  abort: () => void;
  call: (callback?: Common.JSFunction) => void;
  defer: () => void;
  setReq: (type: string, value: any) => void;
  till: (
    continueUntilFn: Common.JSFunction<any, any, 1>,
    retryLimit: number,
    frequency?: number
  ) => void;
  type?: string;
  req?: any;
  options: {
    url: string;
    headers?: Common.Object<string>;
    method?: string;
    callback: (response: any) => void;
    data?: string | Common.Object<string | string[]>;
  };
};
type options = FetchPrototype['options'];

/** End of types */

const sessionIdHeader = 'X-Razorpay-SessionId';
const trackIdHeader = 'X-Razorpay-TrackId';
const Xhr = XMLHttpRequest;
import * as _El from './DOM';
const networkError = _.rzpError('Network error');
let jsonp_cb = 0;
let sessionId: string, trackId: string, keylessHeader: string;

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
function setPollDelayBy(xTimes: number) {
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
function resetPoll(this: any, options: options): FetchPrototype | null {
  resumePoll();
  if (this) {
    return this(options);
  }
  return null;
}

/**
 * Sets the session ID.
 * @param {string} id
 *
 * @returns {void}
 */
function setSessionId(id: string) {
  sessionId = id;
}

/**
 * Sets the track ID.
 * @param {string} id
 *
 * @returns {void}
 */
function setTrackId(id: string) {
  trackId = id;
}

/**
 * Sets the keyless header.
 * @param {string} id
 *
 * @returns {void}
 */
function setKeylessHeader(id: string) {
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
function appendQueryParamToUrl(
  url: string,
  paramName: string,
  paramValue: string
) {
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
function appendKeylessHeaderParamToUrl(
  url: string,
  keylessHeader: string
): string {
  return appendQueryParamToUrl(url, 'keyless_header', keylessHeader);
}

/**
 * Sends a fetch request with the given options
 * @param {Object} options
 *
 * @returns {Object}
 */
export default function fetch(this: FetchPrototype | void, options: options) {
  if (!_.is(this, fetch)) {
    return new (fetch as any)(options);
  }
  (this as FetchPrototype).options = normalizeOptions(options);
  (this as FetchPrototype).defer();
}

const fetchPrototype: FetchPrototype = {
  options: {
    url: '',
    method: 'get',
    callback: (_) => _,
  },
  setReq: function (type: string, value: any) {
    this.abort();
    this.type = type;
    this.req = value;
    return this;
  },

  till: function (
    continueUntilFn: (response: any) => any,
    retryLimit = 0,
    frequency = 3e3
  ) {
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
        this.call((response: any) => {
          // If there is an error, retry again until retry limit.
          if (response.error && retryLimit > 0) {
            this.till(continueUntilFn, retryLimit - 1, frequency);
          } else if (continueUntilFn(response)) {
            this.till(continueUntilFn, retryLimit, frequency);
          } else if (this.options.callback) {
            this.options.callback(response);
          }
        });
      }, nextReqFrequency)
    );
  },

  abort: function () {
    // this.req, which may be XMLHttpRequest object, setTimeout ID
    // or jsonp callback counter
    const self = this;
    const { req, type } = self;

    // return if already null
    if (!req) {
      return;
    }

    if (type === 'ajax') {
      req.abort();
    } else if (type === 'jsonp') {
      global.Razorpay[req] = (_: any) => _;
    } else {
      clearTimeout(req);
    }
    this.req = null;
  },

  defer: function () {
    this.req = setTimeout(() => this.call());
  },

  call: function (this: FetchPrototype, callback = this.options.callback) {
    const { method, data, headers = {} } = this.options;
    let { url } = this.options;
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

    const xhr = new Xhr();
    this.setReq('ajax', xhr);

    xhr.open(method as string, url, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status) {
        let json = _Obj.parse(xhr.responseText);
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
      const resp = networkError;
      resp.xhr = {
        status: 0,
      };

      global.dispatchEvent(
        _.CustomEvent('rzp_network_error', {
          detail: {
            method,
            url,
            baseUrl: url?.split('?')[0],
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

    _Obj.loop(headers, (v: string, k: string) => xhr.setRequestHeader(k, v));

    xhr.send(data as string);
  },
};

fetchPrototype.constructor = fetch;
fetch.prototype = fetchPrototype;

function normalizeOptions(options: string | options): options {
  let updatedOptions = options as options;
  if (_.isString(options)) {
    updatedOptions = { url: options } as options;
  }
  if (updatedOptions) {
    const { method, headers, callback } = updatedOptions;
    let { data } = updatedOptions;
    // set normalized defaults
    if (!headers) {
      updatedOptions.headers = {};
    }
    if (!method) {
      updatedOptions.method = 'get';
    }
    if (!callback) {
      updatedOptions.callback = (_) => _;
    }
    if (_.isNonNullObject(data) && !_.is(data, FormData)) {
      data = _.obj2query(data);
    }
    updatedOptions.data = data;

    return updatedOptions;
  }
  return options as options;
}

/**
 * Sends post request with the given options.
 * @param {Object} opts
 *
 * @returns {Object}
 */
function post(opts: options): FetchPrototype {
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
function put(opts: options): FetchPrototype {
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
function patch(opts: options): FetchPrototype {
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
function jsonp(options: options): FetchPrototype {
  if (!options.data) {
    options.data = {};
  }

  // callbackIndex is the nth fetch.jsonp call
  const callbackIndex = jsonp_cb++;

  // We need to use attempt numbers to generate unique URLs
  let attemptNumber = 0;

  const request = new (fetch as any)(options);
  options = request.options;

  request.call = function (cb = options.callback) {
    // This is the same fetch.jsonp instance. Incrememt the attempt number.
    attemptNumber++;

    const callbackName = `jsonp${callbackIndex}_${attemptNumber}`;

    let done = false;

    const onload = function (this: any) {
      if (
        !done &&
        (!this.readyState ||
          this.readyState === 'loaded' ||
          this.readyState === 'complete')
      ) {
        done = true;
        this.onload = this.onreadystatechange = null;
        _El.detach(this);
      }
    };

    const req = (global.Razorpay[callbackName] = function (data: any) {
      delete data['http_status_code'];
      cb(data);
      delete global.Razorpay[callbackName];
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
    const script = _El.create('script');
    _Obj.extend(script, {
      src,
      async: true,
      onerror: () => cb(networkError),
      onload,
      onreadystatechange: onload,
    });

    _El.appendTo(script, document.documentElement);
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
