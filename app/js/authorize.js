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

function makeAutoSubmitForm(url, data){
  return '<form action="'+url+'" method="post">'+deserialize(data)+'</form><script>document.forms[0].submit()</script>';
}

function setPayloadStorage(payload){
  try{
    localStorage.setItem(_btoa(payload));
  } catch(e){}
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

function handleResponse(response, payment){
  invoke(
    responseTypes[response.type],
    payment,
    response.request
  )
}

function makeRedirectUrl(fees){
  return discreet.makeUrl() + 'payments/create/' + (fees ? 'fees' : 'checkout');
}

function formatPayment(data, params, getOption) {
  if(getOption('redirect')){
    // add callback_url if redirecting
    var callback_url = getOption('callback_url');
    if(callback_url){
      data.callback_url = callback_url;
    }
    return discreet.redirect({
      url: makeRedirectUrl(params.fees),
      content: data,
      method: 'post'
    });
  }

  // add tracking data
  data['_[id]'] = _uid;
  data['_[medium]'] = discreet.medium;
  data['_[context]'] = discreet.context;
  data['_[checkout]'] = !!discreet.isFrame;
  if(params.powerwallet){
    data['_[source]'] = 'checkoutjs';
  }

  if(!data.key_id){
    data.key_id = getOption('key');
  }
  if(!data.currency){
    data.currency = getOption('currency');
  }

  return {
    get: getOption,
    data: data,
    fees: params.fees,
    powerwallet: params.powerwallet
  };
}

function clearPayment(payment){
  try{
    payment.popup.onClose = null;
    payment.popup.close();
  } catch(e){}
  payment.done = true;

  // unbind listener
  payment.offmessage();
  clearPollingInterval();
}

function shouldPopup(payment) {
  return !discreet.isFrame || payment.data.fees || !payment.powerwallet;
}

// virtually all the time, unless there isn't an ajax based route
function shouldAjax(payment){
  return !payment.fees;
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

function makeAjax(payment){
  var data = payment.data;
  var url = discreet.makeUrl() + 'payments/create/ajax?key_id=' + data.key_id;
  delete data.key_id;
  $.post({
    url: url,
    data: data,
    callback: makeAjaxCallback(payment)
  })
}

function makeAjaxCallback(payment){
  return function(response){
    var payment_id = response.payment_id;
    if (payment_id) {
      payment.payment_id = payment_id;
    }

    if (response.razorpay_payment_id || response.error) {
      payment.emit('success');
    } else {
      handleResponse(response, payment);
    }
  }
}

function makeOnMessage(popup, onComplete){
  return function(e){
    if (popup && popup.window === e.source || communicator && communicator.contentWindow === e.source) {
      onComplete(e.data);
    }
  }
}

function generatePayment(payment){
  var popup = payment.popup;

  // show loading screen in popup
  writePopup(popup, templates.popup(payment));

  if (shouldAjax(payment)) {
    makeAjax(payment);
  } else if (popup) {
    submitForm(
      makeRedirectUrl(payment.fees),
      payment.data,
      'post',
      popup.name
    );
  } else {
    setPayloadStorage(payment.message);
  }

  // adding listeners
  if(discreet.isFrame){
    var completeCallback = payment.complete = window.onComplete = makeOnComplete(payment);
    pollPaymentData(completeCallback);
  }
  payment.offmessage = $(window).on('message', makeOnMessage(popup, completeCallback));
}

function makeOnComplete(payment){
  return function(data){
    if(payment.done){
      return;
    }

    clearPayment(payment);

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
  }
}

var razorpayProto = Razorpay.prototype;
razorpayProto.createPayment = function(data, params) {
  var payment = this._payment = formatPayment(data, params, this.get);
  this.on('payment.cancel', function(errorObj){
    if(!payment.done){
      var payment_id = payment.payment_id;
      if(payment_id){
        $.ajax({
          url: discreet.makeUrl() + 'payments/' + payment_id + '/cancel?key_id=' + payment.data.key_id
        })
      }
      makeOnComplete(payment)(errorObj || discreet.defaultError());
    }
  });

  payment.off = bind(this.off, this);
  payment.emit = bind(
    function(event, arg){
      this.emit('payment.' + event, arg);
    },
    this
  )

  if (shouldPopup(payment)) {
    var popup = payment.popup = makePopup();
    if (popup) {
      popup.onClose = this.emitter('payment.cancel');
    } else {
      localStorage.removeItem('payload');
      submitForm(discreet.makeUrl(true) + 'submitPayload.php', null, null, '_blank');
    }
  }

  if (params.paused) {
    writePopup(popup, params.message);
    this.one('unpause', generatePayment, payment);
  } else {
    generatePayment(payment);
  }
  return this;
}

razorpayProto.submitOTP = function(otp){
  var payment = this._payment;
  $.post({
    url: payment.otpurl,
    data: {
      type: 'otp',
      otp: otp
    },
    callback: function(response){
      var error = response.error;
      if(error && error.action === 'RETRY'){
        return payment.emit('otp.required');
      }
      payment.complete(response);
    }
  })
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
