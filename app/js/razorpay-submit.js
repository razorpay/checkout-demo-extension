var popupRequest = null;

discreet.setupPopup = function(request, url){
  if(popupRequest){
    return console.error('Razorpay: another payment popup is open');
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
    data: request.data,
    url: url
  }

  if(_rahe.isIEMobile){
    _rahe.setupCC(request, templateVars);
  } else {
    try{
      var popup = request.popup = new Popup('');
      popup.window.document; // let this throw error
    } catch(e){
      roll('Going newtab because ' + e.message);
      return _rahe.setupCC(request, templateVars);
    }
    try{
      templateVars.image = options.image;
      popup.window.document.write(templates.popup(templateVars));
      popup.window.document.close();

      popup.onClose(function(){
        _rahe.onComplete({error:{description:'Payment cancelled'}});
      })
      var info;
      if(typeof popup.window == 'undefined'){
        info = "Popup window inaccessible";
      } else if(popup.window && popup.window.closed){
        info = "Popup window closed";
      } else {
        info = "Popup window opened";
      }
      roll(info, {image: options.image, name: options.name, description: options.description});
    } catch(e){
      roll('Error accessing popup: ' + e.message);
    }
  }
}

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
      var formHTML = '';
      for(i in data){
        var j = i.replace(/"/g,''); // attribute sanitize
        formHTML += '<input type="hidden" name="'+j+'" value="'+data[i]+'">';
      }
      form.innerHTML = formHTML;
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
    if(typeof popupRequest !== 'object')
      return;

    if(typeof data === 'string')
      data = JSON.parse(data);

    _rahe.handleResponse(popupRequest, data);

    try{
      popupRequest.popup.close();
    } catch(e){
      roll(e.message);
    }

    popupRequest = null;
    $.removeMessageListener();
    if(_rahe.ccInterval){
      clearInterval(_rahe.ccInterval);
      _rahe.ccInterval = null;
    }
    return true; // if true, popup closes itself.
  },

  handleResponse: function(popupRequest, data){
    if (data.error && data.error.description){
      if(typeof popupRequest.error === 'function'){
        popupRequest.error(data);
      }
    }
    else if(typeof popupRequest.success == 'function' && typeof data.razorpay_payment_id == 'string' && data.razorpay_payment_id){
      var returnObj = 'signature' in data ? data : {razorpay_payment_id: data.razorpay_payment_id};
      popupRequest.success.call(null, returnObj); // dont expose request as this
    }
    else if(typeof popupRequest.error == 'function'){
      popupRequest.error({description: 'Unable to parse server response'});
      roll('unexpected api response', data);
    }
  }
}

/**
  method for payment data submission to razorpay api
  @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
*/
Razorpay.payment = {
  authorize: function(request, throwError){
    if(typeof request != 'object' || typeof request.data !== 'object'){
      return false;
    }
    var rdata = request.data;

    if(!request.options)
      request.options = Razorpay.defaults;
    var options = request.options;

    var defaultFields = ['amount', 'notes', 'currency'];
    for(var i=0; i<defaultFields.length;i++){
      var field = defaultFields[i];
      if(!(field in rdata) && field in options)
        rdata[field] = options[field];
    }

    if(!rdata.key_id)
      rdata.key_id = options.key;
    var errors = Razorpay.payment.validate(rdata);
    if(errors && errors.length){
      if(throwError){
        throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
      }
      return false;
    }

    for(var i in rdata.notes){
      rdata['notes['+i+']'] = rdata.notes[i];
    }
    delete rdata.notes;
    var url = discreet.makeUrl(options) + '/payments/create/checkout';

    if(options.redirect){
      _rahe.formSubmit(url, 'post', rdata);
      return true;
    } else {
      if(!rdata.callback_url && options.callback_url) rdata.callback_url = options.callback_url;
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
        if(typeof callback == 'function'){
          callback(response);
        }
      },
      complete: function(data){
        if(typeof data == 'object' && data.error && typeof callback == 'function')
          callback({error: true});
      }
    });
  }
};