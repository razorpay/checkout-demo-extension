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
  var data = payment.data;

  // fix long notes
  each(data, function(key, val) {
    if (/^notes/.test(key) && val.length > 200) {
      data[key] = val.replace(/\n/g, ' ');
    }
  })

  // no ajax route was available
  if (popup) {
    submitForm(
      makeRedirectUrl(payment.fees),
      data,
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

function getTrackingData(data) {
  var trackingData = clone(data);

  // donottrack card number, token, cvv
  each(trackingData, function(field) {
    if (field.slice(0, 4) === 'card') {
      delete trackingData[field];
    }
  })
  return trackingData;
}

function trackNewPayment(data, params, r) {
  track(r, 'submit', {
    data: getTrackingData(data),
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
  this.powerwallet = params.powerwallet || data && data.method === 'upi';
  this.message = params.message;
  this.tryPopup();

  if (params.paused) {
    try {
      this.writePopup();
    } catch(e){}
    this.data = data;
    this.on('resume', bind('generate', this));
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
      if (callback_url) {
        data.callback_url = callback_url;
      }
      if (!this.powerwallet || (data.method === 'upi' && !discreet.isFrame)) {
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

    var expiry = data['card[expiry]'];
    if (isString(expiry)) {
      data['card[expiry_month]'] = expiry.slice(0, 2);
      data['card[expiry_year]'] = expiry.slice(-2);
      delete data['card[expiry]'];
    }

    // add tracking data
    data._ = getCommonTrackingData();
    // make it flat
    flattenProp(data, '_', '[]');
  },

  generate: function(data) {
    this.data = clone(data || this.data);
    this.format();

    if (this.shouldPopup() && !this.popup && this.r.get('callback_url')) {
      this.r.set('redirect', true);
    }

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

    if (data.action === 'TOPUP') {
      return invoke(otpCallback, this, data);
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

  clear: function() {
    try {
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}
    this.done = true;
    Razorpay.popup_delay = null;
    clearInterval(this.popup_track_interval);
    clearTimeout(this.ajax_delay);

    // unbind listener
    if(this.offmessage){
      this.offmessage();
    }
    clearPollingInterval();
    abortAjax(this.ajax);
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

    var razorpayInstance = this.r;
    var ajax_delay_timeout = 1e4;
    this.ajax_delay = setTimeout(function() {
      track(razorpayInstance, 'ajax_delay', {
        delay: ajax_delay_timeout
      })
    }, ajax_delay_timeout);

    var ajax_options = {
      url: url,
      data: data,
      callback: bind(ajaxCallback, this)
    }

    if (discreet.isFrame) {
      ajax_options.headers = {
        'x-checkout-id': _uid
      }
      if (data.order_id) {
        ajax_options.headers['x-order-id'] = data.order_id;
      }
    }

    track(razorpayInstance, 'ajax');
    this.ajax = ajaxFn(ajax_options);
    return this.ajax;
  },

  makePopup: function() {
    var popup = new Popup('', 'popup_' + _uid);
    if (popup && !popup.window || popup.window.closed !== false) {
      popup.close();
      popup = null;
    }

    if (popup) {
      var self = this;
      var nowTime = now();

      Razorpay.popup_delay = function() {
        track(self.r, 'popup_delay', {
          duration: new Date() - nowTime
        });
      }
      Razorpay.popup_track = function() {
        try {
          noop(self.popup.window.document);
        } catch(e) {
          clearInterval(self.popup_track_interval);
          track(self.r, 'popup_acs', {
            duration: new Date() - nowTime
          });
        }
      }
      self.popup_track_interval = setInterval(Razorpay.popup_track, 99);
      popup.onClose = this.r.emitter('payment.cancel');
    }
    this.popup = popup;
    return popup;
  },

  writePopup: function() {
    var popup = this.popup;
    if (popup) {
      popup.write(templates.popup(this));
    }
  },

  shouldPopup: function() {
    return !(this.r.get('redirect') || this.powerwallet);
  },

  tryPopup: function() {
    if (this.shouldPopup()) {
      this.makePopup();
    }
  }
}

function ajaxCallback(response) {
  clearTimeout(this.ajax_delay);
  track(this.r, 'ajax_response', response);
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
    if (request.data) {
      this.emit('payment.data', request.data);
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
  first: function(request) {
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
      // popup blocking addons close popup once we set a url
      var self = this;
      setTimeout(function() {
        if (popup.window.closed && self.r.get('callback_url')) {
          self.r.set('redirect', true);
          self.checkRedirect();
        }
      })
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
    self.ajax = recurseAjax(url, function(response) {
      self.complete(response);
    }, function(response) {
      return response && response.status;
    }, null, $.jsonp);
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
  if (data && 'data' in data) {
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
      var request = response.request;
      if (isRedirect && !response.error && request) {
        discreet.redirect({
          url: request.url,
          content: request.content,
          method: request.method || 'post'
        });
      } else {
        ajaxCallback.call(payment, response);
      }
    }
  });
}

Razorpay.setFormatter = FormatDelegator;

razorpayPayment.authorize = function(options){
  var r = Razorpay({amount: options.data.amount}).createPayment(options.data);
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
}

razorpayPayment.validate = function(data) {
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
}

razorpayPayment.getPrefs = function(data, callback){
  var url = makeUrl('preferences') + '?';
  each(data, function(key, val) {
    url += key + '=' + val + '&';
  })
  return $.ajax({
    url: url.slice(0, -1),
    timeout: 30000,
    callback: function(response){
      if (response.xhr && response.xhr.status === 0) {
        return getPrefsJsonp(data, callback);
      }
      invoke(callback, null, response);
    }
  });
}

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    submitForm(data.url, data.content, data.method);
  }
};
