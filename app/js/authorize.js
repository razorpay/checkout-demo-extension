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

function Request(params){
  if(!(this instanceof Request)){
    return new Request(params);
  }
  var errors = this.format(params);
  if(errors){
    return errors;
  }

  this.params = params;
  var data = params.data;

  if(this.shouldPopup()){
    if(!(this.popup = this.makePopup())){
      return this.postSubmit();
    }
  }

  return this.makeAjax();

  // prevent callback_url from being submitted if not redirecting
  delete data.callback_url;
  this.track();

  if(!discreet.supported(true)){
    return true;
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
    fill(params, ['success', 'error', 'secondfactor', 'options']);
    var data = params.data;

    if(!data.key_id){
      data.key_id = Razorpay.defaults.key;
    }

    if(_uid){
      data['_[id]'] = _uid;
      data['_[medium]'] = discreet.medium;
      data['_[context]'] = discreet.context;
    }

    return Razorpay.payment.validate(data);
  },

  cancel: function(errorObj){
    discreet.onComplete.call(this, errorObj || discreet.defaultError());
  },

  makeUrl: function(fees){
    return discreet.makeUrl() + 'payments/create/' + (fees ? 'fees' : 'checkout');
  },

  makeAjax: function(){
    this.ajax = $.post({
      url: discreet.makeUrl() + 'payments/create/ajax',
      data: this.params.data,
      callback: bind(this.ajaxCallback, this)
    })
  },

  ajaxCallback: function(response){
    if(response.razorpay_payment_id || response.error){
      this.complete(response);
    } else {
      var nextRequest = response.request;
      if(response.type === 'otp'){
        this.secondfactor(nextRequest);
      } else {
        window.onComplete = bind(this.complete, this);
        this.nextRequest(nextRequest);
      }
    }
  },

  nextRequest: function(request){
    if(this.params.options.redirect){
      discreet.nextRequestRedirect({
        url: request.url,
        content: request.content,
        method: request.method
      });
    } else if(this.popup){
      submitForm(
        request.url,
        request.content,
        request.method,
        this.popup.name
      )
    } else {
      // TODO
      var result = _btoa(stringify(request));
      if(communicator.contentWindow === window){
        setCookie('nextRequest', result);
      } else {
        communicator.src = getCommuniactorSrc() + '#' + result;
      }
    }
  },

  postSubmit: function(){

  },

  shouldPopup: function(){
    var params = this.params;
    return params.options.redirect || params.data.wallet !== 'mobikwik';
  },

  makePopup: function(){
    if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
      return null;
    }
    try{
      var popup = new Popup('', 'popup_' + _uid);
    } catch(e){
      return null;
    }
    try{
      var pdoc = popup.window.document;
      pdoc.write(templates.popup(this.params));
      pdoc.close();
    } catch(e){}

    return popup;
  },

  complete: function(data){
    this.clear();
    try {
      if(typeof data !== 'object') {
        data = JSON.parse(data);
      }
    }
    catch(e) {
      return roll('unexpected api response', data);
    }

    var payment_id = data.razorpay_payment_id;
    if(typeof payment_id === 'string' && payment_id){
      var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
      return invoke(this.params.success, null, returnObj, 0); // dont expose request as this
    }

    if(!data.error || typeof data.error !== 'object' || !data.error.description){
      data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
    }
    invoke(this.params.error, null, data, 0);
    // track.call(this, 'failure', {response: data, data: request.orig});
  },

  clear: function(){
    try{
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}

    // clearCookieInterval();
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
