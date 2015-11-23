var popupRequest = null;
var templates = {};
var _ch_communicator_frame;

discreet.setCommunicator = function(){
  if(ua.indexOf('MSIE') === -1){
    return;
  }
  if(location.href.indexOf(discreet.makeUrl(Razorpay.defaults)) !== 0){
    if(!_ch_communicator_frame){
      _ch_communicator_frame = document.createElement('iframe');
      _ch_communicator_frame.style.display = 'none';
    }
    _ch_communicator_frame.src = discreet.makeUrl(Razorpay.defaults, true) + 'communicator.php';
    document.documentElement.appendChild(_ch_communicator_frame);
  } else if (_ch_communicator_frame){
    _ch_communicator_frame.parentNode.removeChild(_ch_communicator_frame);
    _ch_communicator_frame = null;
  }
}
discreet.setCommunicator();

function _deleteCookie(name){
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
};

function _setCookie(name, value){
  document.cookie = name + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
};

function _getCookie(name){
  var nameEQ = name + "=";
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
};

var _rs_ccInterval = null;
var _rs_isIEMobile = /Windows Phone/.test(ua);

function _rs_formSubmit(action, method, data, target){
  var form = document.createElement('form');
  form.setAttribute('action', action);

  if(method){
    form.setAttribute('method', method);
  }

  if(target) {
    form.setAttribute('target', target);
  }

  if(data){
    form.innerHTML = deserialize(data);
  }
  document.body.appendChild(form);
  form.submit();
}

function _rs_onComplete(data){
  if(!popupRequest || !data) { return }

  try {
    if(typeof data !== 'object') {
      data = JSON.parse(data);
    }
  }
  catch(e) {
    roll('unexpected api response', data);
    return;
  }

  _rs_handleResponse(popupRequest, data);

  Razorpay.payment.cancel();
  return true; // if true, popup closes itself.
}

function _rs_setupCC(request, templateVars, target){
  _setCookie('submitPayload', JSON.stringify(templateVars));
  _rs_formSubmit(
    discreet.makeUrl(request.options, true) + 'processing.php',
    null,
    null,
    (target || '_blank')
  );
  _deleteCookie('onComplete');
  if(!target){
    _rs_ccInterval = setInterval(function(){
      var c = _getCookie('onComplete');
      if(c){
        _deleteCookie('onComplete');
        _rs_onComplete(c);
      }
    }, 500)
  }
}

function _rs_handleResponse( popupRequest, data ) {
  if (
    typeof popupRequest.success === 'function' &&
    typeof data.razorpay_payment_id === 'string' &&
    data.razorpay_payment_id
  ) {
    var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
    track('success', returnObj);
    return setTimeout(function(){popupRequest.success.call(null, returnObj)}); // dont expose request as this
  }

  if(!data.error || typeof data.error !== 'object' || !data.error.description)
    data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};

  track('fail', data);
  setTimeout(function(){popupRequest.error.call(null, data)});
}

function _rs_onmessage(e){
  if(e.origin) {
    if (
      (e.source && e.source !== popupRequest.popup.window) ||
      (discreet.makeUrl(popupRequest.options).indexOf(e.origin) !== 0)
    ){
      return roll('message received from origin', e.origin);
    }

    _rs_onComplete(e.data);
  }
}

function _rs_setupPopup(request, url){
  if(popupRequest){
    return window.console && console.error('Razorpay: another payment popup is open');
  }
  popupRequest = request;
  var options = request.options;
  var data = request.data;

  if(data.callback_url){
    return discreet.nextRequestRedirect({
      method: 'post',
      url: url,
      content: data
    });
  }
  if(request.postmessage === false){
    window.onComplete = _rs_onComplete;
  }
  $.addMessageListener(_rs_onmessage, request);

  var templateVars = {
    data: data,
    url: url
  }


  // new tab for IE Mobile
  if(_rs_isIEMobile){
    _rs_setupCC(request, templateVars);
  } else {
    var popup;
    var name = 'popup_' + _uid;
    var routed;
    try{
      popup = request.popup = new Popup('', name);
      popup.window.document; // let this throw error
    } catch(e){

      // if popup could not be opened
      if(!popup.window){
        roll('Going newtab because ' + e.message, null, 'warn');
        return _rs_setupCC(request, templateVars);
      }

      // if popup is opened, but could not access document
      routed = true;
      roll('Going routed popup because' + e.message, null, 'warn');
      _rs_setupCC(request, templateVars, name);
    }
    try{
      if(!routed){
        templateVars.formHTML = deserialize(data);
        templateVars.image = options.image;
        popup.window.document.write(templates.popup(templateVars));
        popup.window.document.close();
      }

      popup.onClose(function(){
        _rs_onComplete({error:{description:'Payment cancelled'}});
      })
    } catch(e){
      roll('Error accessing popup: ' + e.message);
    }
  }
};
/**
  method for payment data submission to razorpay api
  @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
*/
Razorpay.payment = {
  cancel: function(){
    if(!popupRequest){
      return;
    }

    try{
      popupRequest.popup.close();
    } catch(e){
      roll(e.message, null, 'warn');
    }

    popupRequest = null;
    $.removeMessageListener();
    if(_rs_ccInterval){
      clearInterval(_rs_ccInterval);
      _rs_ccInterval = null;
    }
  },
  authorize: function(request, throwError){
    if(typeof request !== 'object' || typeof request.data !== 'object'){
      return false;
    }
    var rdata = request.data;

    if(!request.options){
      request.options = Razorpay.defaults;
    }
    var options = request.options;

    each(
      ['amount', 'currency'],
      function(i, field){
        if(!(field in rdata) && field in options){
          rdata[field] = options[field];
        }
      }
    )
    if(!rdata.key_id){
      rdata.key_id = options.key;
    }
    var errors = Razorpay.payment.validate(rdata);
    if(errors && errors.length){
      if(throwError){
        throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
      }
      return false;
    }
    var url = discreet.makeUrl(options) + '/payments/create/checkout';

    if(options.redirect){
      _rs_formSubmit(url, 'post', rdata);
      return true;
    }

    else {
      var trackingPayload = {
        email: rdata.email,
        contact: rdata.contact,
        method: rdata.method
      }

      track('submit', trackingPayload);

      if(!rdata.callback_url && options.callback_url) {
        rdata.callback_url = options.callback_url;
      }
      _rs_setupPopup(request, url);
    }
  },

  validate: function(data, throwError){
    var errors = [];

    var amount = parseInt(data.amount);
    if (!amount || typeof amount !== 'number' || amount < 0 || String(amount).indexOf('.') !== -1) {
      errors.push({
        message: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (typeof data.key_id === "undefined") {
      errors.push({
        message: "No merchant key specified",
        field: "key"
      });
    }

    if (data.key_id === "") {
      errors.push({
        message: "Merchant key cannot be empty",
        field: "key"
      });
    }

    if(errors.length && throwError){
      throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
    } else {
      return errors;
    }
  },

  getMethods: function(callback){
    return $.jsonp({
      url: discreet.makeUrl(Razorpay.defaults) + Razorpay.defaults.methodsUrl,
      data: {key_id: Razorpay.defaults.key},
      timeout: 30000,
      success: function(response){
        if(typeof callback === 'function'){
          callback(response);
        }
      },
      complete: function(data){
        if(typeof data === 'object' && data.error && typeof callback === 'function') {
          callback({error: true});
        }
      }
    });
  }
};