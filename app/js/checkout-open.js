// flag for checkout-js
discreet.isCheckout = true;
var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

var ch_isOpen,
ch_CriOS_interval,
ch_CriOS_listener,
ch_CriOS_frame,
ch_frameContainer,
ch_backdrop,
ch_metaViewportTag,
ch_metaViewport;

// there is no "position: fixed" in iphone
var shouldFixFixed = /iPhone OS 4|Android 2\./.test(ua);
var docStyle = document.documentElement.style;
var merchantMarkup = {

  _: {
    meta: null,
    body: null,
    overflow: ''
  },

  reset: function() {
    docStyle.overflow = this._.overflow;
  },

  clear: function() {
    this._.overflow = docStyle.overflow;
    docStyle.overflow = 'hidden';
  }
}

discreet.setCommunicator = function(opts){
  if(!isCriOS){
    return;
  }
  if(!ch_CriOS_frame){
    ch_CriOS_frame = document.createElement('iframe');
    ch_CriOS_frame.style.display = 'none';
    document.documentElement.appendChild(ch_CriOS_frame);
  }
  ch_CriOS_frame.src = discreet.makeUrl(opts, true) + 'CriOS-frame.php';
}
discreet.setCommunicator(Razorpay.defaults);

function ch_createFrame(src, tagName){
  var frame = document.createElement(tagName);

  var attrs = {
    'class': 'razorpay-checkout-frame', // quotes needed for ie
    style: 'height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px;',
    allowtransparency: true,
    frameborder: 0,
    width: '100%',
    height: '100%',
    src: src
  };
  each(attrs, function(i, attr){
    frame.setAttribute(i, attr);
  })
  return frame;
}

function ch_close(){
  ch_messageHandlers.dismiss.call(this);
  ch_messageHandlers.hidden.call(this);
}

function ch_onClose(){
  if(ch_CriOS_interval){
    clearInterval(ch_CriOS_interval);
    ch_CriOS_interval = null;
  }
  if(ch_CriOS_listener){
    $(window).off('unload', ch_CriOS_listener);
    ch_CriOS_listener = null;
  }
  $.removeMessageListener();
  ch_isOpen = false;
  merchantMarkup.reset();

  if(ch_metaViewportTag && ch_metaViewportTag.parentNode){
    ch_metaViewportTag.parentNode.removeChild(ch_metaViewportTag);
  }

  var meta = ch_metaViewport;
  if(meta){
    var head = document.getElementsByTagName('head')[0];
    if(head && !meta.parentNode && head.appendChild(meta)){
      ch_metaViewport = null;
    }
  }
  var frame = this.checkoutFrame;
  if(frame){
    if(isCriOS && frame.contentWindow){
      frame.contentWindow.close();
    }
    frame.style.display = 'none';

    if(frame.getAttribute('removable')){
      if(frame.parentNode) {
        frame.parentNode.removeChild(frame);
      }

      this.checkoutFrame = null;
    }
  }

  if(ch_frameContainer){
    ch_frameContainer.style.display = 'none';
  }

  if(this instanceof Razorpay && typeof this.options.modal.onhidden === 'function'){
    this.options.modal.onhidden();
  }
}

var ch_sendFrameMessage = function(response){
  if(isCriOS){
    return;
  }
  if(typeof response !== 'string'){
    response = JSON.stringify(response);
  }
  this.checkoutFrame.contentWindow.postMessage(response, '*');
}

// to handle absolute/relative url of options.image
var ch_setImageOption = function(options){
  if(options.image && typeof options.image === 'string'){
    if(/data:image\/[^;]+;base64/.test(options.image)){
      return;
    }
    if(options.image.indexOf('http')){ // not 0
      var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      var relUrl = '';
      if(options.image[0] !== '/'){
        relUrl += location.pathname.replace(/[^\/]*$/g,'');
        if(relUrl[0] !== '/'){
          relUrl = '/' + relUrl;
        }
      }
      options.image = baseUrl + relUrl + options.image;
    }
  }
}

var ch_setMetaViewport = function(){
  if(typeof document.querySelector !== 'function'){
    return;
  }
  var head = document.querySelector('head')
  if(!head){
    return;
  }

  var meta = head.querySelector('meta[name=viewport]');

  if(meta){
    ch_metaViewport = meta;
    meta.parentNode.removeChild(meta);
  }

  if(!ch_metaViewportTag){
    ch_metaViewportTag = document.createElement('meta');
    ch_metaViewportTag.setAttribute('name', 'viewport');
    ch_metaViewportTag.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }

  if(!ch_metaViewportTag.parentNode){
    head.appendChild(ch_metaViewportTag);
  }
}

function ch_createFrameOptions(){
  var options = {};
  ch_setMetaViewport();

  each(
    this.options, function(i, value){
      if(typeof value !== 'function'){
        options[i] = value;
      }
    }
  )
  for(var i in this.modal.options){
    this.options.modal[i] = this.modal.options[i];
  }
  ch_setImageOption(options);

  var response = {
    context: location.href,
    options: options
  }
  if(_uid){
    response.id = _uid;
  }
  return response;
}

var ch_messageHandlers = {

  load: function() {
    ch_sendFrameMessage.call(this, ch_createFrameOptions.call(this));
  },

  redirect: function(data){
    discreet.nextRequestRedirect(data);
  },

  submit: function(data){
    var cb = window.CheckoutBridge;
    if(cb && typeof cb.onsubmit === 'function'){
      cb.onsubmit(JSON.stringify(data));
    }
  },

  dismiss: function(){
    if(ch_backdrop){
      ch_backdrop.style.background = '';
    }
    if(typeof this.options.modal.ondismiss === 'function'){
      this.options.modal.ondismiss()
    }
  },

  hidden: function(){
    ch_onClose.call(this);
  },

  success: function(data){
    if(this.checkoutFrame){
      this.checkoutFrame.setAttribute('removable', true);
    }
    var handler = this.options.handler;
    if(typeof handler === 'function'){
      setTimeout(function(){
        handler.call(null, data);
      })
    }
    if(isCriOS){
      ch_close.call(this);
    }
  },

  failure: function(data){
    ch_close.call(this);
    alert('Payment Failed.\n' + data.error.description);
  },

  fault: function(){
    alert("Oops! Something went wrong.");
    ch_onClose.call(this);
    this.close();
  }
}

function ch_onFrameMessage(e, data){
  // this === rzp
  if(
    !e.origin ||
    data.source !== 'frame' ||
    !this.checkoutFrame ||
    this.checkoutFrame.getAttribute('src').indexOf(e.origin)
  ){ // source check
    return;
  }
  var event = data.event;
  data = data.data;
  var handler = ch_messageHandlers[event];
  if(typeof handler === 'function'){
    handler.call(this, data);
  }

  if(event === 'dismiss' || event === 'fault'){
    track(event, data);
  }
}

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var ch_defaultPostHandler = function(data){
  var RazorPayForm = currentScript.parentElement;
  RazorPayForm.innerHTML += deserialize(data);
  RazorPayForm.submit();
}

var ch_parseScriptOptions = function(options){
  var category, dotPosition, ix, property;
  each( options, function(i, opt){
    ix = i.indexOf(".");
    if (ix > -1) {
      dotPosition = ix;
      category = i.substr(0, dotPosition);
      property = i.substr(dotPosition + 1);
      options[category] = options[category] || {};
      if(opt === 'true'){
        opt = true;
      }
      else if(opt === 'false'){
        opt = false;
      }
      options[category][property] = opt;
      delete options[i];
    }
  })

  if(options.method){
    ch_parseScriptOptions(options.method);
  }
}

var ch_addButton = function(rzp){
  var button = document.createElement('input');
  var form = currentScript.parentNode;
  button.type = 'submit';
  button.value = rzp.options.buttontext;
  button.className = 'razorpay-payment-button';
  form.appendChild(button);
  form.onsubmit = function(e){
    if(ch_isOpen){
      return;
    }
    e.preventDefault();
    rzp.open();
    return false;
  }
}

/**
* This checks whether we are in automatic mode
* If yes, it puts in the button
*/
function ch_automaticCheckoutInit(){
  var key = currentScript.getAttribute('data-key');
  if (key && key.length > 0){
    var opts = {};
    each(
      currentScript.attributes,
      function(i, attr){
        var name = attr.name
        if(/^data-/.test(name)){
          name = name.replace(/^data-/,'');
          opts[name] = attr.value;
        }
      }
    )
    ch_parseScriptOptions(opts);
    opts.handler = ch_defaultPostHandler;
    var rzp = new Razorpay(opts);
    ch_addButton(rzp);
  }
}

function ch_createFrameContainer(){
  var formHeight = Math.max(innerHeight, 487) + 'px';
  if(!ch_frameContainer){
    ch_frameContainer = document.createElement('div');
    ch_frameContainer.className = 'razorpay-frame-container';
    var style = ch_frameContainer.style;
    var rules = {
      zIndex: '99999',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      '-webkit-transition': '0.2s ease-out top',
      '-webkit-overflow-scrolling': 'touch',
      'overflow-y': 'scroll'
    }
    each(rules, function(i, rule) {
      style[i] = rule;
    })
    ch_backdrop = document.createElement('div');
    ch_backdrop.setAttribute('style', 'min-height: 100%; transition: 0.3s ease-out; -webkit-transition: 0.3s ease-out; -moz-transition: 0.3s ease-out; position: fixed; top: 0; left: 0; width: 100%; height: 100%; filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#96000000, endColorstr=#96000000);');
    ch_frameContainer.appendChild(ch_backdrop);
    merchantMarkup._.body.appendChild(ch_frameContainer);
  }

  ch_frameContainer.style.display = 'block';
  try{
    // setting unsupported value throws error in IE
    ch_backdrop.style.background = 'rgba(0,0,0,0.6)';
  } catch(e){}
}

Razorpay.prototype.open = function() {
  var options = this.options;
  if(!options){
    return;
  }

  if(!merchantMarkup._.body){
    merchantMarkup._.body = document.getElementsByTagName('body')[0];
  }

  if(!merchantMarkup._.body){
    setTimeout(this.open, 100);
  }

  if(ch_isOpen){
    return;
  }
  ch_isOpen = true;

  merchantMarkup.clear();
  $.addMessageListener(ch_onFrameMessage, this);

  ch_createFrameContainer();

  var existing_frame = this.checkoutFrame;
  var src = discreet.makeUrl(options) + '/checkout?key_id=' + options.key;

  if(!existing_frame) {
    this.checkoutFrame = ch_createFrame(
      src,
      isCriOS ? 'div' : 'iframe'
    );
    ch_frameContainer.appendChild(this.checkoutFrame);
  }

  if(isCriOS){
    var self = this;
    var opts = ch_createFrameOptions.call(this);
    opts.options.redirect = true;
    src += '&message=' + _btoa(JSON.stringify(opts));
    ch_CriOS_listener = $(window).on('unload', ch_close, false, this);
    this.checkoutFrame.contentWindow = window.open(src, '');
    ch_CriOS_interval = setInterval(function(){
      if(self.checkoutFrame.contentWindow.closed){
        ch_close.call(self);
      }
    }, 500)
  }

  if( !this.checkoutFrame.contentWindow ) {
    ch_onClose();
    alert(
      (isCriOS ? 'Chrome for iOS' : 'This browser') +
      ' is not supported.\nPlease try payment in another browser.'
    );
  }

  if(existing_frame) {
    this.checkoutFrame.style.display = 'block';
    ch_setMetaViewport();
    ch_sendFrameMessage.call(this, {event: 'open'});
  }
};

Razorpay.prototype.close = function(){
  if(ch_isOpen){
    ch_sendFrameMessage.call(this, {event: 'close'});
  }
};


discreet.validateCheckout = function(options){
  if( options.display_currency === 'USD' ){
    options.display_amount = String(options.display_amount).replace(/([^0-9\. ])/g,'');
    if(!options.display_amount){
      return 'display_amount';
    }
  } else if ( options.display_currency ) {
    return 'display_currency';
  }
};

// Get the ball rolling in case we are in manual mode
ch_automaticCheckoutInit();