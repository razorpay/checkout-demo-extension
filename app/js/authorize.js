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
    communicator.src = getCommuniactorSrc();
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

  invoke('listener', rzp._request);
  rzp._request = null;
  clearCookieInterval();
}

function onPopupClose(){
  var request_id;
  try {
    request_id = this._request.payment_id;
  } catch(e){}

  if(request_id){
    $.ajax({
      url: discreet.makeUrl() + 'payments/' + request_id + '/cancel',
      headers: {
        Authorization: 'Basic ' + _btoa(this.get('key') + ':')
      }
    })
    track.call(this, 'cancel');
  }
  this.cancelPayment();
}

function onMessage(e){
  var request = this._request;
  if(e.origin) {
    if (
      (!request.popup || e.source !== request.popup.window && e.source !== communicator.contentWindow) ||
      discreet.makeUrl().indexOf(e.origin)
    ){
      return;
    }
    discreet.onComplete.call(this, e.data);
  }
}

if(!discreet.isFrame){
  discreet.lib = 'razorpayjs';
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
    setTimeout(function(){
      request.success.call(null, returnObj); // dont expose request as this
    })
    return track.call(this, 'success', {response: returnObj, data: request.orig});
  }

  if(!data.error || typeof data.error !== 'object' || !data.error.description){
    data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
  }
  invoke(request.error, null, data, 0);
  track.call(this, 'failure', {response: data, data: request.orig});
}

function setupAjax(rzp, callback){
  var request = rzp._request;

  request.ajax = $.post({
    url: discreet.makeUrl() + 'payments/create/ajax',
    data: request.data,
    callback: function(response){
      invoke(callback, rzp, response);
    }
  })
}

function Request(params){
  if(!(this instanceof Request)){
    return new Request(params);
  }
  var errors = this.format(params);
  if(errors){
    return errors;
  }

  var data = this.data;
  var url = this.makeUrl(params.fees);

  if(params.ajax){
    return setupAjax(this, params.success);
  }

  if(params.redirect){
    discreet.nextRequestRedirect({
      url: url,
      content: data,
      method: 'post'
    });
    return false;
  }
  // prevent callback_url from being submitted if not redirecting
  delete data.callback_url;
  this.track();

  if(!discreet.supported(true)){
    return true;
  }

  var name;
  var popup = this.popup = this.createPopup(url, params);

  if(!popup){
    name = '_blank'
  } else {
    // popup.onClose = bind(onPopupClose, this);

    if(popup.cc){
      name = popup.name;
    }
  }


  if(name){
    submitForm(discreet.makeUrl(true) + 'processing.php', null, null, name);
    setupAjax(this, function(response){
      var result = _btoa(stringify(response.request));
      if(communicator.contentWindow === window){
        setCookie('nextRequest', result);
      } else {
        communicator.src = getCommuniactorSrc() + '#' + result;
      }
    });
  }

  this.listener = $(window).on('message', onMessage, null, this);

  if(discreet.isFrame){
    cookiePoll(this);
  }
}

Request.prototype = {
  format: function(params){
    if(typeof params !== 'object' || typeof params.data !== 'object'){
      return err('malformed payment request object');
    }
    var data = this.data = params.data;

    if(!data.key_id){
      data.key_id = Razorpay.defaults.key;
    }

    if(!params.options){
      params.options = emo;
    }

    if(_uid){
      data['_[id]'] = _uid;
      data['_[medium]'] = discreet.medium;
      data['_[context]'] = discreet.context;
      if(discreet.shouldAjax(data)){
        data['_[source]'] = 'checkoutjs';
      }
    }

    return Razorpay.payment.validate(data);
  },

  cancel: function(errorObj){
    discreet.onComplete.call(this, errorObj || discreet.defaultError());
  },

  makeUrl: function(fees){
    return discreet.makeUrl() + 'payments/create/' + (fees ? 'fees' : 'checkout');
  },

  createPopup: function(url, params){
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
      params: params,
      url: url,
      formHTML: deserialize(params.data)
    }

    try{
      var pdoc = popup.window.document;
      pdoc.write(templates.popup(templateVars));
      pdoc.close();
    }
    catch(e){
      popup.cc = true;
    }

    return popup;
  },

  track: function(){
    var data = this.data;
    var trackingPayload = this.trackingPayload = {};
    each(
      [
        'email',
        'contact',
        'method',
        'card[name]',
        'bank',
        'wallet',
        'emi_duration'
      ],
      function(i, key){
        if(key in data){
          trackingPayload[key] = data[key];
        }
      }
    )
    // track.call(rzp, 'submit', {data: trackingPayload});
  }
}

Razorpay.payment = {
  authorize: Request,
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

  getPrefs: function(key, callback){
    return $.jsonp({
      url: discreet.makeUrl() + 'preferences',
      data: {key_id: key},
      timeout: 30000,
      success: function(response){
        invoke(callback, null, response);
      }
    });
  },

  getMethods: function(callback){
    return Razorpay.payment.getPrefs(Razorpay.defaults.key, function(response){
      callback(response.methods);
    })
  }
};
