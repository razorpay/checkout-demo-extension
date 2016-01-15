var templates = {};
var popupRequest, cookieInterval, communicator;

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

function getCommuniactorSrc(opts){
  return discreet.makeUrl(true) + 'communicator.php';
}

discreet.setCommunicator = function(opts){
  if(communicator && communicator.parentNode){
    communicator.parentNode.removeChild(communicator);
  }
  if(
    location.href.indexOf(discreet.makeUrl()) &&
    (/MSIE |Windows Phone|Trident\//.test(ua) || (isCriOS && !discreet.isFrame))
  ) {
    communicator = document.createElement('iframe');
    communicator.style.display = 'none';
    document.documentElement.appendChild(communicator);
    communicator.src = getCommuniactorSrc(opts);
  } else {
    communicator = {contentWindow: window};
  }
}
discreet.setCommunicator(Razorpay.defaults);

function submitFormData(action, data, method, target) {
  var form = document.createElement('form');
  form.setAttribute('action', action);

  if(method){ form.setAttribute('method', method) }
  if(target) { form.setAttribute('target', target) }

  if(data){ form.innerHTML = deserialize(data) }

  document.documentElement.appendChild(form);
  form.submit();
  form.parentNode.removeChild(form);

  // if(target && discreet.isFrame){
  //   cookiePoll();
  // }
}

function cookiePoll(){
  deleteCookie('onComplete');

  cookieInterval = setInterval(function(){
    var cookie = getCookie('onComplete');
    if(cookie){
      clearCookieInterval();
      onComplete(cookie);
    }
  }, 150)
}

function createPopup(data, url, options) {
  if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
    return null;
  }

  var popup;
  var name = 'popup_'// + _uid;
  try{
    popup = new Popup('', name);
  }
  catch(e){
    return null;
  }
  var templateVars = {
    options: options,
    url: url,
    formHTML: deserialize(data)
  }

  try{
    writePopup(popup, templateVars);
    if(/FxiOS/.test(ua)){
      setTimeout(function(){
        writePopup(popup, templateVars);
      }, 1000)
    }
  }
  catch(e){
    popup.cc = true;
  }

  popup.onClose = function(){
    Razorpay.payment.cancel();
  }

  return popup;
}

function writePopup(popup, templateVars){
  popup.window.document.write(templates.popup(templateVars));
  popup.window.document.close();
}

function clearRequest(){
  try{
    if(popupRequest.popup){
      popupRequest.popup.onClose = null;
      popupRequest.popup.close();
    }
  } catch(e){
    roll('error closing popup: ' + e.message, null, 'warn');
  }

  popupRequest = null;
  $.removeMessageListener();
  clearCookieInterval();
}

function formatRequest(request){
  if(typeof request !== 'object' || typeof request.data !== 'object'){
    return err('malformed payment request object');
  }
  var rdata = request.data;

  if(!request.options){
    request.options = Razorpay.defaults;
  }
  var options = request.options;

  each(
    ['amount', 'currency', 'callback_url', 'signature'],
    function(i, field){
      if(!(field in rdata) && options[field]){
        rdata[field] = options[field];
      }
    }
  )
  if(!rdata.key_id){
    rdata.key_id = options.key;
  }
  return Razorpay.payment.validate(rdata);
}

function onMessage(e){
  if(e.origin) {
    if (
      (!popupRequest.popup || e.source !== popupRequest.popup.window && e.source !== communicator.contentWindow) ||
      discreet.makeUrl().indexOf(e.origin)
    ){
      return roll('message received from origin', e.origin, 'info');
    }
    onComplete(e.data);
  }
}

function onComplete(data, request){
  if(!request){
    request = popupRequest;
  }

  if(!request || !data) { return }

  clearRequest();
  try {
    if(typeof data !== 'object') {
      data = JSON.parse(data);
    }
  }
  catch(e) {
    return roll('unexpected api response', data);
  }
  if (
    typeof request.success === 'function' &&
    typeof data.razorpay_payment_id === 'string' &&
    data.razorpay_payment_id
  ) {
    var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
    return setTimeout(function(){
      request.success.call(null, returnObj); // dont expose request as this
    })
  }

  if(!data.error || typeof data.error !== 'object' || !data.error.description){
    data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
  }
  invoke(request.error, null, data, 0);
}

function setupAjax(request){
  var options = request.options;

  $.post({
    url: discreet.makeUrl() + 'payments/create/ajax',
    data: request.data,
    callback: function(response){
      var result;

      if(response.version === 1){
        result = response.request;
      }

      else {
        onComplete(response);
        result = {
          result: response.razorpay_payment_id ? 'Payment Successful.' : response.error && response.error.description || 'Payment Failed.'
        }
      }

      result = _btoa(JSON.stringify(result));
      if(communicator.contentWindow === window){
        setCookie('nextRequest', result);
      } else {
        communicator.src = getCommuniactorSrc(options) + '#' + result;
      }
    }
  })
}

Razorpay.payment = {

  cancel: function(errorObj){
    onComplete(errorObj || {error:{description:'Payment cancelled'}});
  },

  authorize: function(request){
    var error = formatRequest(request);
    if(error){
      return error;
    }
    var rdata = request.data;
    var options = request.options;

    var url = discreet.makeUrl() + 'payments/create/checkout';

    if(options.redirect || options.callback_url){
      discreet.nextRequestRedirect({
        url: url,
        content: rdata,
        method: 'post'
      });
      return false;
    }

    var trackingPayload = {};
    each(
      ['key_id', 'amount', 'email', 'contact', 'method', 'bank', 'wallet', 'card[name]'],
      function(i, field){
        if(field in rdata){
          trackingPayload[field] = rdata[field];
        }
      }
    )
    // track('submit', trackingPayload);

    var name;
    request.popup = createPopup(rdata, url, options);
    if(!request.popup){
      name = '_blank'
    } else if(request.popup.cc){
      name = request.popup.name;
    }

    if(name){
      submitFormData(discreet.makeUrl(true) + 'processing.php', null, null, name);
      setupAjax(request);
    }
    $.addMessageListener(onMessage, request);

    if(discreet.isFrame){
      cookiePoll();
    }

    popupRequest = request;
  },

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

  getMethods: function(callback){
    return $.jsonp({
      url: discreet.makeUrl() + 'methods',
      data: {key_id: Razorpay.defaults.key},
      timeout: 30000,
      success: function(response){
        invoke(callback, null, response);
      },
      complete: function(data){
        if(typeof data === 'object' && data.error) {
          invoke(callback, null, {error: true});
        }
      }
    });
  }
};
