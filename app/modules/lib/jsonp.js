const CALLBACK_KEY = 'jsonp_callback';

var getAjaxParams = function(options) {
  var params = {
    data: options.data,
    error: options.error || func.noop,
    success: options.success || func.noop,
    callback: options.callback || func.noop,
    url: options.url || ''
  };

  if (!params.data) {
    params.data = {};
  }
  params.data.callback = 'Razorpay.' + CALLBACK_KEY;

  return (
    params |> set('computedUrl', _.appendParamsToUrl(params.url, params.data))
  );
};

export default function(options) {
  if (!options.data) {
    options.data = {};
  }

  var params = getAjaxParams(options);
  var done = false;

  Razorpay[CALLBACK_KEY] = function(data) {
    unset(data, 'http_status_code');

    params.success(data, params);
    params.callback(data, params);

    unset(Razorpay, CALLBACK_KEY);
  };

  var script = document.createElement('script');
  script.src = params.computedUrl;
  script.async = true;

  script.onerror = function(e) {
    params.error({ error: true, url: script.src, event: e });
    params.callback({ error: true, url: script.src, event: e }, params);
  };

  script.onload = script.onreadystatechange = function() {
    if (
      !done &&
      (!this.readyState ||
        this.readyState === 'loaded' ||
        this.readyState === 'complete')
    ) {
      done = true;
      script.onload = script.onreadystatechange = null;
      script.parentNode.removeChild(script);
      script = null;
    }
  };
  var head = document.documentElement;
  head.appendChild(script);
  return {
    abort: function() {
      if (Razorpay[CALLBACK_KEY]) {
        Razorpay[CALLBACK_KEY] = func.noop;
      }
    }
  };
}
