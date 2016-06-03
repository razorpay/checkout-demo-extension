var templates = {};

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

function onPaymentCancel(errorObj){
  if(!this.done){
    var payment_id = this.payment_id;
    if(payment_id) {
      $.ajax({
        url: discreet.makeUrl() + 'payments/' + payment_id + '/cancel?key_id=' + this.r.get('key'),
        callback: bind(function(response) {
          if (response.status === 'authorized') {
            this.complete({
              razorpay_payment_id: payment_id
            });
          } else {
            this.complete(errorObj || discreet.error());
          }
        }, this)
      });
    } else {
      this.complete(errorObj || discreet.error());
    }
  }
}

function Payment(data, params, r){
  if(!params || typeof params !== 'object'){
    params = emo;
  }
  // saving razorpay instance
  this.r = r;

  // sanitize this.data, set fee, powerwallet flags
  this.format(data, params);

  // redirect if specified
  if(this.checkRedirect()){
    return;
  }

  this.on('cancel', onPaymentCancel);

  var popup = this.tryPopup();

  if (params.paused) {
    if (popup) {
      popup.write(templates.popup(this));
    }
    this.on('resume', this.generate);
  } else {
    this.generate();
  }
}

Payment.prototype = {
  on: function(event, handler){
    this.r.on(event, bind(handler, this), 'payment');
  },

  emit: function(event, arg){
    this.r.emit('payment.' + event, arg);
  },

  off: function(){
    this.r.off('payment');
  },

  checkRedirect: function(){
    var getOption = this.r.get;
    if(getOption('redirect')){
      var data = this.data;
      // add callback_url if redirecting
      var callback_url = getOption('callback_url');
      if(callback_url){
        data.callback_url = callback_url;
      }
      discreet.redirect({
        url: makeRedirectUrl(this.fees),
        content: data,
        method: 'post'
      });
      return true;
    }
  },

  format: function(data, params){
    // add tracking data
    data['_[id]'] = _uid;
    data['_[medium]'] = discreet.medium;
    data['_[context]'] = discreet.context;
    data['_[checkout]'] = !!discreet.isFrame;
    if(params.powerwallet){
      data['_[source]'] = 'checkoutjs';
    }

    // fill data from options if empty
    var getOption = this.r.get;

    each(
      ['amount', 'currency', 'signature', 'description', 'order_id', 'notes'],
      function(i, field){
        if(!(field in data)){
          var val = getOption(field);
          if(val){
            data[field] = val;
          }
        }
      },
      this
    )

    if(!data.key_id){
      data.key_id = getOption('key');
    }

    // flatten notes
    // notes.abc -> notes[abc]
    each(
      data.notes,
      function(key, val){
        var valType = typeof val;
        if (valType === 'string' || valType === 'number' || valType === 'boolean'){
          data['notes[' + key + ']'] = val;
        }
      }
    )
    delete data.notes;

    this.data = data;
    this.fees = params.fees;
    this.powerwallet = params.powerwallet;
    this.message = params.message;
  },

  generate: function(){
    var popup = this.popup;

    // show loading screen in popup
    if (popup) {
      this.message = null;
      popup.write(templates.popup(this));
    }

    if (!this.tryAjax()) {
      // no ajax route was available
      if (popup) {
        submitForm(
          makeRedirectUrl(this.fees),
          this.data,
          'post',
          popup.name
        )
      } else {
        setPayloadStorage(this.message);
      }
    }

    // adding listeners
    if(discreet.isFrame){
      var complete = window.onComplete = bind(this.complete, this);
      pollPaymentData(complete);
    }
    this.offmessage = $(window).on('message', bind(onMessage, this));
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
      this.emit('success', returnObj);
    } else {
      if(!data.error || typeof data.error !== 'object' || !data.error.description){
        data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
      }
      this.emit('error', data);
    }

    this.off();
  },

  clear: function(){
    try{
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}
    this.done = true;

    // unbind listener
    if(this.offmessage){
      this.offmessage();
    }
    clearPollingInterval();
    if(this.ajax){
      this.ajax.abort();
    }
    this.r._payment = null;
  },

  tryAjax: function(){
    // virtually all the time, unless there isn't an ajax based route
    // or its cross domain ajax. in that case, let popup redirect for sake of IE
    if(this.fees || !discreet.isFrame){
      return false;
    }
    // else make ajax request
    var data = this.data;
    var url = discreet.makeUrl() + 'payments/create/ajax?key_id=' + data.key_id;
    delete data.key_id;

    // return xhr object
    this.ajax = $.post({
      url: url,
      data: data,
      callback: bind(ajaxCallback, this)
    })
    return this.ajax;
  },

  tryPopup: function(){
    if(this.powerwallet){
      return null;
    }

    var popup;
    // unsupported browsers
    if(!/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)){
      try{
        popup = this.popup = new Popup('', 'popup_' + _uid);
      } catch(e){
        return null;
      }
    }

    if (popup) {
      popup.onClose = this.r.emitter('payment.cancel');
    } else {
      // popup creation failed
      localStorage.removeItem('payload');
      submitForm(discreet.makeUrl(true) + 'submitPayload.php', null, null, '_blank');
    }
    return popup;
  }
}

function ajaxCallback(response){
  var payment_id = response.payment_id;
  if (payment_id) {
    this.payment_id = payment_id;
  }
  if (response.razorpay_payment_id || response.error) {
    this.complete(response);
  } else {
    var request = response.request;
    if(request && request.url && RazorpayConfig.framepath){
      request.url = request.url.replace(/^.+v1\//, discreet.makeUrl());
    }
    invoke(responseTypes[response.type], this, request);
  }
}

function pollPaymentData(onComplete) {
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
      onComplete(paymentData);
    }
  }, 150)
}

function onMessage(e){
  if (this.popup && this.popup.window === e.source || communicator && communicator.contentWindow === e.source) {
    this.complete(e.data);
  }
}

function makeAutoSubmitForm(url, data){
  return '<form action="'+url+'" method="post">'+deserialize(data)+'</form><script>document.forms[0].submit()</script>';
}

function setPayloadStorage(payload){
  try{
    localStorage.setItem('payload', _btoa(payload));
  } catch(e){}
}

function makeRedirectUrl(fees){
  return discreet.makeUrl() + 'payments/create/' + (fees ? 'fees' : 'checkout');
}

var responseTypes = {
  // this === payment
  first: function(request){
    var direct = request.method === 'direct';
    var content = request.content;
    var popup = this.popup;
    if(popup){
      if(direct){
        // direct is true for payzapp
        popup.write(content);
      } else {
        submitForm(
          request.url,
          request.content,
          request.method,
          popup.window
        )
      }
    } else {
      // set in localStorage for lumia
      setPayloadStorage(direct ? content : makeAutoSubmitForm(request.url, content));
    }
  },

  otp: function(request){
    this.otpurl = request.url;
    this.emit('otp.required');
  }
}

function otpCallback(response){
  var error = response.error;
  if(error && error.action === 'RETRY'){
    return this.emit('otp.required', 'Entered OTP was incorrect. Re-enter to proceed.');
  }
  this.complete(response);
}

var razorpayProto = Razorpay.prototype;
razorpayProto.createPayment = function(data, params) {
  this._payment = new Payment(data, params, this);
  return this;
}

razorpayProto.submitOTP = function(otp){
  var payment = this._payment;
  payment.ajax = $.post({
    url: payment.otpurl,
    data: {
      type: 'otp',
      otp: otp
    },
    callback: bind(otpCallback, payment)
  })
}

razorpayProto.resendOTP = function(callback){
  var payment = this._payment;
  payment.ajax = $.post({
    url: discreet.makeUrl() + 'payments/' + payment.payment_id + '/otp_resend?key_id=' + this.get('key'),
    data: {
      '_[source]': 'checkoutjs'
    },
    callback: bind(ajaxCallback, payment)
  });
}

Razorpay.payment = {
  authorize: function(options){
    var r = Razorpay({amount: options.data.amount}).createPayment(options.data);
    r.on('payment.success', options.success);
    r.on('payment.error', options.error);
    return r;
  },
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

  getPrefs: function(data, callback){
    return $.jsonp({
      url: discreet.makeUrl() + 'preferences',
      data: data,
      timeout: 30000,
      success: function(response){
        invoke(callback, null, response);
      }
    });
  },

  getMethods: function(callback){
    return Razorpay.payment.getPrefs({
      key_id: Razorpay.defaults.key
    }, function(response){
      callback(response.methods);
    });
  }
};
