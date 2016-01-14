// flag for checkout-js
discreet.isCheckout = true;
var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

var isOpen, isLoaded, existingInstance,
ch_CriOS_interval,
ch_CriOS_listener,
ch_CriOS_frame,
ch_frameContainer,
ch_backdrop,
ch_metaViewportTag,
ch_metaViewport;

var ch_PageY = 0;

discreet.setCommunicator = function(opts){
  if(!isCriOS){
    return;
  }
  if(!ch_CriOS_frame){
    ch_CriOS_frame = document.createElement('iframe');
    ch_CriOS_frame.style.display = 'none';
    document.documentElement.appendChild(ch_CriOS_frame);
  }
  ch_CriOS_frame.src = discreet.makeUrl(true) + 'CriOS-frame.php';
}
discreet.setCommunicator(Razorpay.defaults);

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
  // $.removeMessageListener();
  isOpen = false;
  merchantMarkup.reset();

  if(ch_metaViewportTag && ch_metaViewportTag.parentNode){
    $(ch_metaViewportTag).remove();
  }

  var meta = ch_metaViewport;
  if(meta){
    var head = document.querySelector('head');
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
  }

  if(ch_frameContainer){
    ch_frameContainer.style.display = 'none';
  }

  if(this instanceof Razorpay && typeof this.options.modal.onhidden === 'function'){
    this.options.modal.onhidden();
  }
}

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var ch_defaultPostHandler = function(data){
  var RazorPayForm = currentScript.parentNode;
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
    if(isOpen){
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
  var opts = {};
  var preload = false;
  each(
    currentScript.attributes,
    function(i, attr){
      var name = attr.name
      if(/^data-/.test(name)){
        preload = true;
        name = name.replace(/^data-/,'');
        opts[name] = attr.value;
      }
    }
  )

  ch_parseScriptOptions(opts);
  var amount = currentScript.getAttribute('data-amount');

  if (amount && amount.length > 0){
    opts.handler = ch_defaultPostHandler;
    ch_addButton(Razorpay(opts));
  }
  else if(preload){
    Razorpay.configure(opts);
  }
}

function createFrameContainer(){
  var div = document.createElement('div');
  div.className = 'razorpay-container';
  var style = div.style;
  var rules = {
    'zIndex': '99999',
    'position': shouldFixFixed ? 'absolute' : 'fixed',
    'top': 0,
    'display': 'none',
    'left': 0,
    'height': '100%',
    'width': '100%',
    '-webkit-transition': '0.2s ease-out top',
    '-webkit-overflow-scrolling': 'touch',
    '-webkit-backface-visibility': 'hidden',
    'overflow-y': 'visible'
  }
  each(
    rules,
    function(i, rule) {
      style[i] = rule;
    }
  )
  doc.appendChild(div);
  return div;
}

function createFrameBackdrop(){
  var backdrop = document.createElement('div');
  backdrop.className = 'razorpay-backdrop';
  var style = backdrop.style;
  each(
    {
      'min-height': '100%',
      'transition': '0.3s ease-out',
      '-webkit-transition': '0.3s ease-out',
      '-moz-transition': '0.3s ease-out',
      'position': 'fixed',
      'top': 0,
      'left': 0,
      'width': '100%',
      'height': '100%',
      'filter': 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#96000000, endColorstr=#96000000)'
    },
    function(ruleKey, value){
      style[ruleKey] = value;
    }
  )
  frameContainer.appendChild(backdrop);
  return backdrop;
}

var frameContainer = createFrameContainer();
var frameBackdrop = createFrameBackdrop();

function setBackdropColor(value){
  // setting unsupported value throws error in IE
  try{ frameBackdrop.style.background = value; }
  catch(e){}
}

Razorpay.prototype.open = function() {
  if(!this.checkoutFrame){
    this.checkoutFrame = new CheckoutFrame();
  }
  this.checkoutFrame.openRzp(this);
  return;

  merchantMarkup.clear();

  if(isCriOS) {
    var self = this;
    var opts = ch_createFrameOptions.call(this);
    opts.options.redirect = true;

    var src = discreet.makeUrl() + '/checkout?key_id=' + options.key + '&message=' + _btoa(JSON.stringify(opts));
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
};

Razorpay.prototype.close = function(){
  if(this.checkoutFrame){
    this.checkoutFrame.postMessage({event: 'close'});
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
