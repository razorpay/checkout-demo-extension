var popupRequest = null;
var templates = {};

var _rahe = {

  ccInterval: null,
  isIEMobile: /Windows Phone/.test(ua),

  setupCC: function(request, templateVars){
    $.setCookie('submitPayload', JSON.stringify(templateVars));
    _rahe.formSubmit(
      request.options.protocol + '://' + request.options.hostname + '/processing.php',
      null,
      null,
      '_blank'
    );
    $.deleteCookie('onComplete');
    _rahe.ccInterval = setInterval(function(){
      var c = $.getCookie('onComplete');
      if(c){
        $.deleteCookie('onComplete');
        _rahe.onComplete(c);
      }
    }, 500)
  },

  formSubmit: function(action, method, data, target){
    var form = document.createElement('form');
    form.setAttribute('action', action);

    if(method){
      form.setAttribute('method', method);
    }

    if(target){
      form.setAttribute('target', target);
    }

    if(data){
      form.innerHTML = deserialize(data);
    }
    document.body.appendChild(form);
    form.submit();
  },

  onmessage: function(e){
    if(discreet.makeUrl(popupRequest.options).indexOf(e.origin) !== 0){
      return roll('message received from origin', e.origin);
    }
    _rahe.onComplete(e.data);
  },

  onComplete: function(data){
    if(!popupRequest) { return }

    _rahe.handleResponse(popupRequest, data);

    Razorpay.payment.cancel();
    return true; // if true, popup closes itself.
  },

  handleResponse: function(popupRequest, data){
    try{

      if(typeof data === 'string'){
        data = JSON.parse(data);
      }

      if(typeof popupRequest.success === 'function' && typeof data.razorpay_payment_id === 'string' && data.razorpay_payment_id){
        var returnObj = 'signature' in data ? data : {razorpay_payment_id: data.razorpay_payment_id};
        return popupRequest.success.call(null, returnObj); // dont expose request as this
      }

      else if(typeof popupRequest.error !== 'function'){
        return;
      }
      data.error.description;
    }
    catch(e){
      data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
      roll('unexpected api response', e.message);
    }
    popupRequest.error.call(null, data);
  }
}

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
    if(_rahe.ccInterval){
      clearInterval(_rahe.ccInterval);
      _rahe.ccInterval = null;
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
      ['amount', 'notes', 'currency'],
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
      _rahe.formSubmit(url, 'post', rdata);
      return true;
    } else {
      if(!rdata.callback_url && options.callback_url) {
        rdata.callback_url = options.callback_url;
      }
      discreet.setupPopup(request, url);
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
    return $.ajax({
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

discreet.setupPopup = function(request, url){
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
    window.onComplete = _rahe.onComplete;
  }
  else {
    $.addMessageListener(_rahe.onmessage, request);
  }

  var templateVars = {
    data: data,
    url: url,
    formHTML: deserialize(data)
  }

  if(_rahe.isIEMobile){
    _rahe.setupCC(request, templateVars);
  } else {
    var popup;
    try{
      popup = request.popup = new Popup('');
      popup.window.document; // let this throw error
    } catch(e){
      roll('Going newtab because ' + e.message, null, 'warn');
      return _rahe.setupCC(request, templateVars);
    }
    try{
      templateVars.image = options.image;
      popup.window.document.write(templates.popup(templateVars));
      popup.window.document.close();

      popup.onClose(function(){
        _rahe.onComplete({error:{description:'Payment cancelled'}});
      })
      roll('popup', null, 'info');
    } catch(e){
      roll('Error accessing popup: ' + e.message);
    }
  }
};