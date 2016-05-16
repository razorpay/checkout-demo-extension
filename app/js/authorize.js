var templates = {};

function makeFormHtml64(url, data){
  return _btoa('<form action="'+url+'" method="post">'+deserialize(data)+'</form><script>document.forms[0].submit()</script>');
}

var pollingInterval;

function clearPollingInterval(force){
  if(force || pollingInterval){
    try {
      localStorage.removeItem('onComplete');
    } catch(e) {}
    deleteCookie('onComplete');
    clearInterval(pollingInterval);
    pollingInterval = null;
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

var communicator;
function setCommunicator(){
  var baseCommUrl = discreet.makeUrl(true);
  if (location.href.indexOf(baseCommUrl) && (/MSIE |Windows Phone|Trident\//.test(ua))) {
    communicator = document.createElement('iframe');
    communicator.style.display = 'none';
    doc.appendChild(communicator);
    communicator.src = discreet.makeUrl(true) + 'communicator.php';
  }
}
setCommunicator();

function pollPaymentData(request) {
  clearPollingInterval(true);
  pollingInterval = setInterval(function(){
    var paymentData;
    try {
      paymentData = localStorage.getItem('onComplete');
    } catch(e) {}
    if(!paymentData){
      paymentData = getCookie('onComplete');
    }

    if(paymentData) {
      clearPollingInterval();
      request.complete(paymentData);
    }
  }, 150)
}

function onMessage(e){
  if (
    e.origin
    && this.popup
    && (e.source === this.popup.window || e.source === communicator.contentWindow)
  ) {
    this.complete(e.data);
  }
}

// this === request
function ajaxCallback(response){
  this.payment_id = response.payment_id;

  if(response.razorpay_payment_id || response.error){
    this.complete(response);
  } else {
    var nextRequest = response.request;
    if(response.type === 'otp'){
      this.secondfactor(makeSecondfactorCallback(this, nextRequest));
    } else {
      this.nextRequest(nextRequest);
    }
  }
}

function makeSecondfactorCallback(request, nextRequest){
  return function(factor){
    $.post({
      url: nextRequest.url,
      data: {
        type: 'otp',
        otp: factor
      },
      callback: request.ajaxCallback
    })
  }
}

function Request(params){
  if(!(this instanceof Request)){
    return new Request(params);
  }

  var errors = this.format(params);
  if(errors){
    return errors;
  }

  var popup,
    data = this.data,
    url = this.makeUrl();

  if(this.shouldPopup()){
    if(this.get('redirect')){
      // add callback_url if redirecting
      var callback_url = this.get('callback_url');
      if(callback_url){
        data.callback_url = callback_url;
      }
      return discreet.redirect({
        url: url,
        content: data,
        method: 'post'
      });
    }
    popup = this.makePopup();
    // open new tab
    if(!popup) {
      localStorage.removeItem('payload');
      submitForm(discreet.makeUrl(true) + 'submitPayload.php', null, null, '_blank');
    }
  } else {
    this.powerwallet = true;
    data['_[source]'] = 'checkoutjs';
  }

  if(!discreet.supported(true)){
    return true;
  }

  if(this.shouldAjax()){
    this.makeAjax();
  } else {
    submitForm(url, data, 'post', popup.name);
  }

  // adding listeners
  if(discreet.isFrame){
    window.onComplete = bind(this.complete, this);
    pollPaymentData(this);
  }
  this.listener = $(window).on('message', bind(onMessage, this));
}

Request.prototype = {

  format: function(params){
    if(typeof params !== 'object' || typeof params.data !== 'object'){
      return err('malformed payment request object');
    }

    var data = this.data = params.data;
    this.get = new Options(params.options).get;
    this.fees = params.fees;
    this.success = params.success || noop;
    this.error = params.error || noop;
    if(params.secondfactor){
      this.secondfactor = params.secondfactor;
    }

    if(!data.key_id){
      data.key_id = Razorpay.defaults.key;
    }
    if(!data.currency){
      data.currency = Razorpay.defaults.currency;
    }

    data['_[id]'] = _uid;
    data['_[medium]'] = discreet.medium;
    data['_[context]'] = discreet.context;
    data['_[checkout]'] = !!discreet.isFrame;

    return Razorpay.payment.validate(data);
  },

  makeUrl: function(){
    var urlType;
    if(this.fees){
      urlType = 'fees';
    } else if(this.get('redirect') && !this.powerwallet){
      urlType = 'checkout';
    } else {
      urlType = 'ajax';
    }
    return discreet.makeUrl() + 'payments/create/' + urlType;
  },

  makeAjax: function(){
    var cb = this.ajaxCallback = bind(ajaxCallback, this);
    var data = this.data;
    var url = this.makeUrl() + '?key_id=' + data.key_id;
    delete data.key_id;

    $.post({
      url: url,
      data: data,
      callback: cb
    })
  },

  nextRequest: function(request){
    var direct = request.method === 'direct';
    var content = request.content;
    if(this.popup){
      if(direct){
        this.writePopup(content);
      } else {
        submitForm(
          request.url,
          request.content,
          request.method,
          this.popup.name
        )
      }
    } else {
      var payload = direct ? _btoa(content) : makeFormHtml64(request.url, content);
      localStorage.setItem('payload', payload);
    }
  },

  // checks whether to use powerwallet or not
  shouldPopup: function(){
    return !discreet.isFrame || this.fees || (this.data.wallet !== 'mobikwik' && this.data.wallet !== 'payumoney');
  },

  // virtually all the time, unless there isn't an ajax based route
  shouldAjax: function(){
    return !this.fees;
  },

  shouldPost: function(){
    return (this.shouldPopup() && !this.popup) || !this.shouldAjax();
  },

  makePopup: function(){
    if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
      return null;
    }
    var popup;
    try{
      popup = this.popup = new Popup('', 'popup_' + _uid);
    } catch(e){
      return null;
    }
    try{
      this.writePopup();
    } catch(e){}

    popup.onClose = bind(this.cancel, this);
    return popup;
  },

  writePopup: function(html){
    var pdoc = this.popup.window.document;
    pdoc.write(html || templates.popup(this));
    pdoc.close();
  },

  cancel: function(errorObj){
    if(!this.done){
      var payment_id = this.payment_id;
      if(payment_id){
        $.ajax({
          url: discreet.makeUrl() + 'payments/' + payment_id + '/cancel?key_id=' + this.get('key')
        })
      }
      this.complete(errorObj || discreet.defaultError());
    }
  },

  complete: function(data){
    if(this.done){
      return;
    }
    this.clear();
    try{
      if(typeof data !== 'object') {
        data = JSON.parse(data);
      }
    }
    catch(e){
      return roll('unexpected api response', data);
    }

    var payment_id = data.razorpay_payment_id;
    if(typeof payment_id === 'string' && payment_id){
      var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
      return invoke(this.success, null, returnObj, 0); // dont expose request as this
    }

    if(!data.error || typeof data.error !== 'object' || !data.error.description){
      data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
    }
    invoke(this.error, null, data, 0);
  },

  clear: function(){
    try{
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}

    this.done = true;
    // unbind listener
    invoke('listener', this);
    clearPollingInterval();
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
  }
}

Razorpay.payment = {
  authorize: Request,
  validate: function(data){
    var errors = [];

    if (!isValidAmount(data.amount)) {
      errors.push({
        description: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (!data.method){
      errors.push({
        description: 'Payment Method not specified',
        field: 'method'
      });
    }

    if (typeof data.key_id === 'undefined') {
      errors.push({
        description: 'No merchant key specified',
        field: 'key'
      });
    }

    if (data.key_id === '') {
      errors.push({
        description: 'Merchant key cannot be empty',
        field: 'key'
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
