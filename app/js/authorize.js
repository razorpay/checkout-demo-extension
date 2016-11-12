var templates = {};

if (!discreet.isFrame) {
  trackingProps.library = 'razorpayjs';
}

var pollingInterval;

function clearPollingInterval(force) {
  if(force || pollingInterval){
    try {
      localStorage.removeItem('onComplete');
    } catch(e) {}
    deleteCookie('onComplete');
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function deleteCookie(name) {
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
function setCommunicator() {
  if (!discreet.isFrame && (isWP || /MSIE |Trident\//.test(ua))) {
    communicator = document.createElement('iframe');
    communicator.style.display = 'none';
    doc.appendChild(communicator);
    communicator.src = RazorpayConfig.api + 'communicator.php';
  }
}
setCommunicator();

function submitPopup(payment) {
  var popup = payment.popup;
  // no ajax route was available
  if (popup) {
    submitForm(
      makeRedirectUrl(payment.fees),
      payment.data,
      'post',
      popup.name
    )
  } else {
    setPayloadStorage(payment.message);
  }
}

function onPaymentCancel(metaParam) {
  if (!this.done) {
    var cancelError = discreet.error();
    var payment_id = this.payment_id;
    var razorpay = this.r;
    if (payment_id) {
      track(razorpay, 'cancel', {payment_id: payment_id});
      var url = makeAuthUrl(razorpay, 'payments/' + payment_id + '/cancel');
      if (isNonNullObject(metaParam)) {
        each(metaParam, function(key, val) {
          url += '&' + key + '=' + val;
        })
      }
      $.ajax({
        url: url,
        callback: bind(function(response) {
          if (response.razorpay_payment_id) {
            track(razorpay, 'cancel_success', response);
          } else {
            response = cancelError;
          }
          this.complete(response);
        }, this)
      });
    } else {
      track(razorpay, 'cancel');
      this.complete(cancelError);
    }
  }
}

function trackNewPayment(data, params, r) {
  var trackingData = clone(data);

  // donottrack card number, token, cvv
  each(trackingData, function(field) {
    if (field.slice(0, 4) === 'card') {
      delete trackingData[field];
    }
  })

  track(r, 'submit', {
    data: trackingData,
    params: params
  });
}

function Payment(data, params, r) {
  // track data, params. we only track first 6 digits of card number, and remove cvv,expiry.
  trackNewPayment(data, params, r);

  // saving razorpay instance
  this.r = r;

  // payment will be validated when resumed. So it's possible to have invalid arguments till it's paused
  this.on('cancel', onPaymentCancel);

  this.fees = params.fees;
  this.powerwallet = params.powerwallet || data.method === 'upi';
  this.message = params.message;
  this.tryPopup();

  if (params.paused) {
    this.writePopup();
    this.on('resume', bind('generate', this, data));
  } else {
    this.generate(data);
  }
}

Payment.prototype = {
  on: function(event, handler){
    return this.r.on('payment.' + event, bind(handler, this));
  },

  emit: function(event, arg){
    this.r.emit('payment.' + event, arg);
  },

  off: function(){
    this.r.off('payment');
  },

  checkRedirect: function() {
    var getOption = this.r.get;
    if (getOption('redirect')) {
      var data = this.data;
      // add callback_url if redirecting
      var callback_url = getOption('callback_url');
      if(callback_url){
        data.callback_url = callback_url;
      }
      if (!this.powerwallet) {
        discreet.redirect({
          url: makeRedirectUrl(this.fees),
          content: data,
          method: 'post'
        });
        return true;
      }
    }
  },

  format: function() {
    var data = this.data;

    // fill data from options if empty
    var getOption = this.r.get;
    each(
      ['amount', 'currency', 'signature', 'description', 'order_id', 'notes'],
      function(i, field) {
        if(!(field in data)) {
          var val = getOption(field);
          if (val) {
            data[field] = val;
          }
        }
      }
    )

    if (!data.key_id) {
      data.key_id = getOption('key');
    }

    // api needs this flag to decide between redirect/otp
    if (this.powerwallet && data.method === 'wallet') {
      data['_[source]'] = 'checkoutjs';
    }
    // flatten notes, card
    // notes.abc -> notes[abc]
    flattenProp(data, 'notes', '[]');
    flattenProp(data, 'card', '[]');

    // add tracking data
    data._ = getCommonTrackingData();
    // make it flat
    flattenProp(data, '_', '[]');
  },

  generate: function(data) {
    this.data = clone(data);
    this.format();
    // redirect if specified
    if(this.checkRedirect()){
      return;
    }

    // show loading screen in popup
    this.writePopup();

    if (!this.tryAjax()) {
      submitPopup(this);
    }

    // adding listeners
    if (discreet.isFrame && !this.powerwallet) {
      var complete = window.onComplete = bind(this.complete, this);
      pollPaymentData(complete);
    }
    this.offmessage = $(window).on('message', bind(onMessage, this));
  },

  complete: function(data) {
    if (this.done) {
      return;
    }

    try {
      if (typeof data !== 'object') {
        data = JSON.parse(data);
      }
    } catch(e) {
      return roll('completed with ' + data, e);
    }
    this.clear();

    if (data.razorpay_payment_id) {
      this.emit('success', data);
    } else {
      var errorObj = data.error;
      if (!isNonNullObject(errorObj) || !errorObj.description) {
        data = discreet.error('Payment failed');
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

  tryAjax: function() {
    var data = this.data;
    // virtually all the time, unless there isn't an ajax based route
    if (this.fees) {
      return false;
    }
    // or its cross domain ajax. in that case, let popup redirect for sake of IE
    if (!discreet.isFrame && (/MSIE /.test(ua) || data.wallet === 'payumoney' || data.wallet === 'freecharge' || data.wallet ==='olamoney')) {
      return false;
    }
    // iphone background ajax route
    if (!this.powerwallet && /iP(hone|ad)/.test(ua)) {
      return false;
    }
    // else make ajax request

    var ajaxFn = $.post;
    var url = makeUrl('payments/create/ajax');

    if (this.mode === 'jsonp') {
      ajaxFn = $.jsonp;
      url = url.replace('ajax', 'jsonp');
    }

    this.ajax = ajaxFn({
      url: url,
      data: data,
      callback: bind(ajaxCallback, this)
    })
    return this.ajax;
  },

  makePopup: function() {
    var popup = this.popup = new Popup('', 'popup_' + _uid);
    if (popup) {
      popup.onClose = this.r.emitter('payment.cancel');
    }
    return popup;
  },

  writePopup: function() {
    var popup = this.popup;
    if (popup) {
      popup.write(templates.popup(this));
    }
  },

  tryPopup: function() {
    var getOption = this.r.get;
    if (getOption('redirect') || this.powerwallet) {
      return;
    }

    if (!this.makePopup()) {
      // popup creation failed
      // check if we've callback_url to rescue, and move to redirect mode
      if (getOption('callback_url')) {
        getOption().redirect = true;
      } else {
        // if no callback_url, try to open a new tab
        localStorage.removeItem('payload');
        submitForm(RazorpayConfig.api + 'submitPayload.php', null, null, '_blank');
      }
    }
  }
}

function ajaxCallback(response) {
  var payment_id = response.payment_id;
  if (payment_id) {
    this.payment_id = payment_id;
  }

  var errorResponse = response.error;
  var popup = this.popup;

  // race between popup close poll and ajaxCallback. don't continue if payment has been canceled
  if (popup && popup.checkClose()) {
    return; // return if it's already closed
  }
  // if ajax call is blocked by ghostery or some other reason, fall back to redirection in popup
  if (errorResponse && response.xhr && response.xhr.status === 0) {
    if (popup) {
      submitPopup(this);
    } else {
      // this won't cause infinite loop of ajax, because jsonp won't add xhr.status key
      this.mode = 'jsonp';
      this.tryAjax();
    }
    return;
  }

  if (response.razorpay_payment_id || errorResponse) {
    this.complete(response);
  } else {
    var request = response.request;
    if(request && request.url && RazorpayConfig.frame){
      request.url = request.url.replace(/^.+v1\//, makeUrl());
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
  return makeUrl('payments/create/' + (fees ? 'fees' : 'checkout'));
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

  async: function(request) {
    var self = this;
    var url = request.url;
    if (url.indexOf('key_id') === -1) {
      url += '?key_id=' + self.r.get('key');
    }
    recurseAjax(url, function(response) {
      self.complete(response);
    }, function(response) {
      self.ajax = this;
      return response && response.status;
    })
    self.emit('upi.pending');
  },

  otp: function(request){
    this.otpurl = request.url;
    this.emit('otp.required');
  },

  'return': function(request){
    discreet.redirect(request);
  }
}

function otpCallback(response){
  var error = response.error;
  if (error) {
    if (error.action === 'RETRY') {
      return this.emit('otp.required', discreet.msg.wrongotp);
    } else if (error.action === 'TOPUP') {
      return this.emit('wallet.topup', error.description);
    }
    this.complete(response);
  }
  ajaxCallback.call(this, response);
}

var razorpayProto = Razorpay.prototype;

razorpayProto.createPayment = function(data, params) {
  if ('data' in data) {
    data = data.data;
    params = data;
  }
  if (!isNonNullObject(params)) {
    params = emo;
  }
  this._payment = new Payment(data, params, this);
  return this;
}

razorpayProto.focus = function() {
  try {
    this._payment.popup.window.focus();
  } catch(e) {}
}

razorpayProto.submitOTP = function(otp) {
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

razorpayProto.resendOTP = function(callback) {
  var payment = this._payment;
  payment.ajax = $.post({
    url: makeAuthUrl(this, 'payments/' + payment.payment_id + '/otp_resend'),
    data: {
      '_[source]': 'checkoutjs'
    },
    callback: bind(ajaxCallback, payment)
  });
}

razorpayProto.topupWallet = function() {
  var payment = this._payment;
  var isRedirect = this.get('redirect');
  if (!isRedirect) {
    payment.makePopup();
    payment.writePopup();
  }

  payment.ajax = $.post({
    url: makeAuthUrl(this, 'payments/' + payment.payment_id + '/topup/ajax'),
    data: {
      '_[source]': 'checkoutjs'
    },
    callback: function(response) {
      if (isRedirect && !response.error) {
        discreet.redirect({
          url: response.request.url,
          content: response.request.content,
          method: 'post'
        });
      } else {
        ajaxCallback.call(payment, response);
      }
    }
  });
}

RazorProto.postInit = function() {
  this._onNewListener = function(event) {
    var self = this;
    if (event === 'ready') {
      Razorpay.payment.getPrefs(makePrefParams(this), function(response) {
        self.methods = response.methods;
        self.emit('ready', response);
      })
    }
  }
}

RazorProto.emi_calculator = function(length, rate) {
  return Razorpay.emi.calculator(this.get('amount')/100, length, rate);
}

Razorpay.setFormatter = FormatDelegator;

Razorpay.payment = {
  authorize: function(options){
    var r = Razorpay({amount: options.data.amount}).createPayment(options.data);
    r.on('payment.success', options.success);
    r.on('payment.error', options.error);
    return r;
  },
  validate: function(data) {
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
      url: makeUrl('preferences'),
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
      callback(response.methods || response);
    });
  }
};

Razorpay.emi = {
  calculator: function(principle, length, rate) {
    rate /= 1200;
    var multiplier = Math.pow(1+rate, length);
    return parseInt(principle*rate*multiplier/(multiplier - 1), 10);
  }
};

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    submitForm(data.url, data.content, data.method);
  }
};
