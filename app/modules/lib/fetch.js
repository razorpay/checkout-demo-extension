const sessionIdHeader = 'X-Razorpay-SessionId';
const Xhr = XMLHttpRequest;

var sessionId;

function setSessionId(id) {
  sessionId = id;
}

export default function fetch(options) {
  if (!_.is(this, fetch)) {
    return new fetch(options);
  }

  this.options = normalizeOptions(options);
  this.defer();
}

_Func.setPrototype(fetch, {
  till: function(continueUntilFn) {
    this.abort();
    this.xhr = setTimeout(() => {
      this.call(response => {
        if (continueUntilFn(response)) {
          this.till(continueUntilFn);
        } else {
          this.options.callback(response);
        }
      });
    }, 3e3);
  },

  abort: function() {
    var xhr = this.xhr;
    if (_.is(xhr, Xhr)) {
      xhr.abort();
    } else if (xhr) {
      clearTimeout(xhr);
    }
    this.xhr = null;
  },

  defer: function() {
    this.xhr = setTimeout(() => this.call());
  },

  call: function(callback = this.options.callback) {
    var { url, method, data, headers } = this.options;

    var xhr = (this.xhr = new Xhr());
    xhr.open(method, url, true);

    if (_.isFunction(callback)) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status) {
          var json = _Obj.parse(xhr.responseText);
          if (!json) {
            json = _.rzpError('Parsing error');
            json.xhr = {
              status: xhr.status,
              text: xhr.responseText
            };
          }
          callback(json);
        }
      };
      xhr.onerror = function() {
        var resp = _.rzpError('Network error');
        resp.xhr = {
          status: 0
        };
        callback(resp);
      };
    }

    headers
      |> _Obj.setTruthyProp(sessionIdHeader, sessionId)
      |> _Obj.loop((v, k) => xhr.setRequestHeader(k, v));

    xhr.send(data);
  }
});

function normalizeOptions(options) {
  if (_.isString(options)) {
    options = {
      url: options
    };
  }

  var { method, headers, data = null } = options;

  if (!headers) {
    options.headers = {};
  }

  if (!method) {
    options.method = 'get';
  }

  if (_.isNonNullObject(data)) {
    data = _.obj2query(data);
  }

  options.data = data;

  return options;
}

function post(opts) {
  opts.method = 'post';
  if (!opts.headers) {
    opts.headers = {};
  }
  opts.headers['Content-type'] = 'application/x-www-form-urlencoded';
  return fetch(opts);
}

fetch.post = post;
fetch.setSessionId = sessionId;
