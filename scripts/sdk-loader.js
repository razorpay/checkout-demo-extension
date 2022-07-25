(function () {
  let prefix = 'https://checkout-static.razorpay.com/build/COMMIT';

  function addJs(retry) {
    let script = document.createElement('script');
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
    let link = document.createElement('link');
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
