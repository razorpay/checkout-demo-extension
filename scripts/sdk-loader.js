(function () {
  var prefix = 'https://checkout-static-next.razorpay.com/build/COMMIT';
  var env = 'traffic_env=__S_TRAFFIC_ENV__';
  var s = location.search;
  history.pushState(null, null, s ? s + '&' + env : '?' + env);

  function addJs(retry) {
    var script = document.createElement('script');
    script.src = prefix + '/checkout-frame.js' + (retry ? '?retry' : '');
    if (!retry) {
      script.crossOrigin = 'anonymous';
      script.onerror = function () {
        addJs(true);
      };
    }
    document.head.appendChild(script);
  }

  function addCss(retry) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = prefix + '/css/checkout.css' + (retry ? '?retry' : '');
    if (!retry) {
      link.onerror = function () {
        addCss(true);
      };
    }
    document.head.appendChild(link);
  }
  addCss();
  addJs();
})();
