var templates = {};
var cookieInterval, communicator;

function clearCookieInterval(){
  if(cookieInterval){
    deleteCookie('onComplete');
    clearInterval(cookieInterval);
    cookieInterval = null;
  }
}

function deleteCookie(name){
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
}

function setCookie(name, value){
  document.cookie = name + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
}

function getCookie(name){
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for( var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
}

function getCommuniactorSrc(){
  return discreet.makeUrl(true) + 'communicator.php';
}

discreet.setCommunicator = function(opts){
  if(communicator && communicator.parentNode){
    communicator.parentNode.removeChild(communicator);
  }
  if(
    location.href.indexOf(discreet.makeUrl(true)) &&
    (/MSIE |Windows Phone|Trident\//.test(ua))
  ) {
    communicator = document.createElement('iframe');
    communicator.style.display = 'none';
    document.documentElement.appendChild(communicator);
    communicator.src = getCommuniactorSrc(opts);
  } else {
    communicator = {contentWindow: window};
  }
}

discreet.setCommunicator(Razorpay.defaults);

function cookiePoll(rzp){
  deleteCookie('onComplete');

  cookieInterval = setInterval(function(){
    var cookie = getCookie('onComplete');
    if(cookie){
      clearCookieInterval();
      discreet.onComplete.call(rzp, cookie);
    }
  }, 150)
}

function createPopup(data, url, options) {
  if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
    return null;
  }

  var popup;
  var name = 'popup_'// + _uid;
  try{
    popup = new Popup('', name);
  }
  catch(e){
    return null;
  }
  var templateVars = {
    options: options,
    url: url,
    formHTML: deserialize(data)
  }

  try{
    writePopup(popup, templateVars);
    if(/FxiOS/.test(ua)){
      setTimeout(function(){
        writePopup(popup, templateVars);
      }, 1000)
    }
  }
  catch(e){
    popup.cc = true;
  }

  return popup;
}

function writePopup(popup, templateVars){
  popup.window.document.write(templates.popup(templateVars));
  popup.window.document.close();
}

function clearRequest(rzp){
  var request = rzp._request;
  try{
    if(request.popup){
      request.popup.onClose = null;
      request.popup.close();
    }
  } catch(e){
    roll('error closing popup: ' + e.message, null, 'warn');
  }

  $(window).off('message', rzp._request.listener);
  rzp._request = null;
  clearCookieInterval();
}

function formatRequest(request){
  if(typeof request !== 'object' || typeof request.data !== 'object'){
    return err('malformed payment request object');
  }
  var rdata = request.data;

  if(!request.options){
    request.options = Razorpay.defaults;
  }
  var options = request.options;

  each(
    ['amount', 'currency', 'callback_url', 'signature', 'description'],
    function(i, field){
      if(!(field in rdata) && options[field]){
        rdata[field] = options[field];
      }
    }
  )
  if(!rdata.key_id){
    rdata.key_id = options.key;
  }

  if(_uid){
    rdata['_[id]'] = _uid;
    rdata['_[medium]'] = discreet.medium;
    rdata['_[context]'] = discreet.context;
    if(discreet.isFrame){
      rdata['_[source]'] = 'checkoutjs';
    }
  }

  return Razorpay.payment.validate(rdata);
}

function trackSubmit(rzp, data){
  var trackingPayload = {};
  each(
    [
      'key_id',
      'amount',
      'email',
      'contact',
      'method',
      'card[name]',
      'bank',
      'wallet',
      'emi_duration',
      'callback_url'
    ],
    function(i, key){
      if(key in data){
        trackingPayload[key] = data[key];
      }
    }
  )
  track.call(rzp, 'submit', trackingPayload);
}

function onMessage(e){
  var request = this._request;
  if(e.origin) {
    if (
      (!request.popup || e.source !== request.popup.window && e.source !== communicator.contentWindow) ||
      discreet.makeUrl().indexOf(e.origin)
    ){
      return roll('message received from origin', e.origin, 'info');
    }
    discreet.onComplete.call(this, e.data);
  }
}

discreet.onComplete = function(data){
  // this === rzp
  var request = this._request;

  if(!request || !data) { return }

  clearRequest(this);

  try {
    if(typeof data !== 'object') {
      data = JSON.parse(data);
    }
  }
  catch(e) {
    return roll('unexpected api response', data);
  }
  if (
    typeof request.success === 'function' &&
    typeof data.razorpay_payment_id === 'string' &&
    data.razorpay_payment_id
  ) {
    var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
    return setTimeout(function(){
      request.success.call(null, returnObj); // dont expose request as this
    })
  }

  if(!data.error || typeof data.error !== 'object' || !data.error.description){
    data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
  }
  invoke(request.error, null, data, 0);
}

function setupAjax(rzp, callback){
  var request = rzp._request;

  $.post({
    url: discreet.makeUrl() + 'payments/create/ajax',
    data: request.data,
    callback: function(response){
      var result;

      if(response.version === 1){
        result = response;
      }

      else {
        discreet.onComplete.call(rzp, response);
        result = {
          result: response.razorpay_payment_id ? 'Payment Successful.' : response.error && response.error.description || 'Payment Failed.'
        }
      }

      invoke(callback, rzp, result);
    }
  })
}

Razorpay.prototype.authorizePayment = function(request){
  var options = request.options = this.options;
  var error = formatRequest(request);
  if(error){
    return error;
  }
  var rdata = request.data;

  var url = discreet.makeUrl() + 'payments/create/checkout';

  if(options.redirect()) {
    discreet.nextRequestRedirect({
      url: url,
      content: rdata,
      method: 'post'
    });
    return false;
  }
  // prevent callback_url from being submitted if not redirecting
  delete rdata.callback_url;
  trackSubmit(this, rdata);
  this._request = request;

  if(request.ajax){
    return setupAjax(this, request.error);
  }

  if(!discreet.supported(true)){
    return false;
  }

  var name;
  request.popup = createPopup(rdata, url, options);

  if(!request.popup){
    name = '_blank'

  } else {
    request.popup.onClose = bind(this.cancelPayment, this);

    if(request.popup.cc){
      name = request.popup.name;
    }
  }


  if(name){
    submitForm(discreet.makeUrl(true) + 'processing.php', null, null, name);
    setupAjax(this, function(response){
      result = _btoa(stringify(response.request));
      if(communicator.contentWindow === window){
        setCookie('nextRequest', result);
      } else {
        communicator.src = getCommuniactorSrc(options) + '#' + result;
      }
    });
  }

  request.listener = $(window).on('message', onMessage, null, this);

  if(discreet.isFrame){
    cookiePoll(this);
  }

  return this;
}

Razorpay.prototype.cancelPayment = function(errorObj){
  discreet.onComplete.call(this, errorObj || discreet.defaultError());
}

Razorpay.payment = {
  authorize: function(request){
    var amount = request.data.amount || Razorpay.defaults.amount;
    return Razorpay({amount: amount}).authorizePayment(request);
  },
  validate: function(data){
    var errors = [];

    var amount = parseInt(data.amount, 10);
    if (!amount || typeof amount !== 'number' || amount < 0 || String(amount).indexOf('.') !== -1) {
      errors.push({
        why: 'Invalid amount specified',
        culprit: 'amount'
      });
    }

    if (typeof data.key_id === 'undefined') {
      errors.push({
        why: 'No merchant key specified',
        culprit: 'key'
      });
    }

    if (data.key_id === '') {
      errors.push({
        why: 'Merchant key cannot be empty',
        culprit: 'key'
      });
    }

    return err(errors);
  },

  getMethods: function(callback){
    return $.jsonp({
      url: discreet.makeUrl() + 'methods',
      data: {key_id: Razorpay.defaults.key},
      timeout: 30000,
      success: function(response){
        invoke(callback, null, response);
      }
    });
  }
};
