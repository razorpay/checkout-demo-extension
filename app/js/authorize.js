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
    if(payment_id){
      $.ajax({
        url: discreet.makeUrl() + 'payments/' + payment_id + '/cancel?key_id=' + this.data.key_id
      })
    }
    this.complete(errorObj || discreet.defaultError());
  }
}

function Payment(data, params, r){
  // saving razorpay instance
  this.r = r;

  // sanitize this.data, set fee, powerwallet flags
  this.format(data, params);

  // redirect if specified
  this.checkRedirect();

  this.on('cancel', onPaymentCancel);

  if (shouldPopup(this)) {
    var popup = this.popup = makePopup();
    if (popup) {
      popup.onClose = r.emitter('payment.cancel');
    } else {
      localStorage.removeItem('payload');
      submitForm(discreet.makeUrl(true) + 'submitPayload.php', null, null, '_blank');
    }
  }

  if (params.paused) {
    writePopup(popup, params.message);
    this.on('resume', this.generate);
  } else {
    this.generate();
  }
}

Payment.prototype = {
  on: function(event, handler){
    this.r.on('payment.' + event, bind(handler, this));
  },

  emit: function(event, arg){
    this.r.emit('payment.' + event, arg);
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
        url: makeRedirectUrl(params.fees),
        content: data,
        method: 'post'
      });
    }
  },

  format: function(data, params){
    data['_[id]'] = _uid;
    data['_[medium]'] = discreet.medium;
    data['_[context]'] = discreet.context;
    data['_[checkout]'] = !!discreet.isFrame;

    var getOption = this.r.get;

    // add tracking data
    if(params.powerwallet){
      data['_[source]'] = 'checkoutjs';
    }

    if(!data.key_id){
      data.key_id = getOption('key');
    }
    if(!data.currency){
      data.currency = getOption('currency');
    }

    this.data = data;
    this.fees = params.fees;
    this.powerwallet = params.powerwallet;
  },

  generate: function(){
    var popup = this.popup;

    // show loading screen in popup
    writePopup(popup, templates.popup(this));

    if (shouldAjax(this)) {
      makeAjax(this);
    } else if (popup) {
      submitForm(
        makeRedirectUrl(this.fees),
        this.data,
        'post',
        popup.name
      );
    } else {
      setPayloadStorage(this.message);
    }

    // adding listeners
    if(discreet.isFrame){
      var complete = window.onComplete = bind(complete, this);
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
      payment.emit('success', returnObj);
    } else {
      if(!data.error || typeof data.error !== 'object' || !data.error.description){
        data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
      }
      payment.emit('error', data);
    }

    payment.off();
  },

  clear: function(){
    try{
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}
    this.done = true;

    // unbind listener
    this.offmessage();
    clearPollingInterval();
  },

  ajax: function(){
    var data = this.data;
    var url = discreet.makeUrl() + 'payments/create/ajax?key_id=' + data.key_id;
    delete data.key_id;
    $.post({
      url: url,
      data: data,
      callback: bind(ajaxCallback, this)
    })
  }
}

function ajaxCallback(response){
  var payment_id = response.payment_id;
  if (payment_id) {
    this.payment_id = payment_id;
  }

  if (response.razorpay_payment_id || response.error) {
    this.emit('success');
  } else {
    invoke(responseTypes[response.type], this, response.request);
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

function shouldPopup(payment) {
  return !discreet.isFrame || payment.data.fees || !payment.powerwallet;
}

// virtually all the time, unless there isn't an ajax based route
function shouldAjax(payment){
  return !payment.fees;
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
          popup.name
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

function writePopup(popup, content){
  if(popup){
    popup.write(content);
  }
}

function makePopup() {
  if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
    return null;
  }
  var popup;
  try{
    popup = new Popup('', 'popup_' + _uid);
  } catch(e){
    return null;
  }
  return popup;
}

var razorpayProto = Razorpay.prototype;
razorpayProto.createPayment = function(data, params) {
  this._payment = new Payment(data, params, this);
  return this;
}

function makeOtpCallback(payment){
  return function(response){
    var error = response.error;
    if(error && error.action === 'RETRY'){
      return payment.emit('otp.required', 'Entered OTP was incorrect. Re-enter to proceed.');
    }
    payment.complete(response);
  }
}

razorpayProto.submitOTP = function(otp){
  var payment = this._payment;
  $.post({
    url: payment.otpurl,
    data: {
      type: 'otp',
      otp: otp
    },
    callback: makeOtpCallback(payment)
  })
}

razorpayProto.resendOTP = function(callback){
  $.post({
    url: discreet.makeUrl() + 'payments/' + this._payment.payment_id + '/otp_resend?key_id=' + this.get('key'),
    data: {
      '_[source]': 'checkoutjs'
    },
    callback: makeOtpCallback(this._payment)
  });
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
