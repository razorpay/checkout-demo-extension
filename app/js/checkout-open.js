var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

// place _ch_frameContainer absolute, and add window.onscroll
var _chBackMinHeight = 0;
var _chPageY = 0;
var _chAbsoluteContainer = /iPhone|Android 2\./.test(ua);

var _ch_isOpen,
_ch_bodyEl,
_ch_frameContainer,
_ch_backdrop,
_ch_metaViewportTag,
_ch_metaViewport,
_ch_bodyOverflow;

var _ch_fallbacks = function(){

  if(/iPhone.+Version\/4\./.test(ua) && typeof document.height === 'number'){
    _chBackMinHeight = document.height;
  }

  if(_chAbsoluteContainer && window.addEventListener){
    window.addEventListener('orientationchange', function(){
      if(_ch_frameContainer){
        _ch_frameContainer.style.height = Math.max(innerHeight, 455) + 'px';
      }
    })
    window.addEventListener('scroll', function(){
      var c = _ch_frameContainer;
      if(!c || !_ch_isOpen || typeof window.pageYOffset !== 'number'){
        return;
      }
      var top;
      var offTop = c.offsetTop - pageYOffset;
      var offBot = c.offsetHeight + offTop;
      if(_chPageY < pageYOffset){
        if(offBot < 0.2*innerHeight && offTop < 0){
          top = pageYOffset + innerHeight - c.offsetHeight;
        }
      }
      else if(_chPageY > pageYOffset){
        if(offTop > 0.1*innerHeight && offBot > innerHeight){
          top = pageYOffset;
        }
      }
      if(typeof top === 'number'){
        c.style.top = Math.max(0, top) + 'px';
      }
      _chPageY = pageYOffset;
    })
  }
}

var _ch_createFrame = function(options){
  var frame = document.createElement('iframe');
  var src = options.framePath || discreet.makeUrl(options) + '/checkout?key_id=' + options.key;

  var attrs = {
    'class': 'razorpay-checkout-frame', // quotes needed for ie
    style: 'position: absolute; height: 100%; background: none; display: block; border: 0 none transparent; overflow: hidden; visibility: visible; margin: 0px; padding: 0px; left: 0px; top: 0px;',
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

var _ch_onClose = function(){
  $.removeMessageListener();
  _ch_isOpen = false;
  _ch_bodyEl.style.overflow = _ch_bodyOverflow;

  if(_ch_metaViewportTag && _ch_metaViewportTag.parentNode){
    _ch_metaViewportTag.parentNode.removeChild(_ch_metaViewportTag);
  }

  var meta = _ch_metaViewport;
  if(meta){
    var head = document.getElementsByTagName('head')[0];
    if(head && !meta.parentNode && head.appendChild(meta)){
      _ch_metaViewport = null;
    }
  }

  if(this.checkoutFrame){
    this.checkoutFrame.style.display = 'none';

    if(this.checkoutFrame.getAttribute('removable')){

      if(this.checkoutFrame.parentNode){
        this.checkoutFrame.parentNode.removeChild(this.checkoutFrame);
      }

      this.checkoutFrame = null;
    }
  }

  if(_ch_frameContainer){
    _ch_frameContainer.style.display = 'none';
  }

  if(this instanceof Razorpay && typeof this.options.modal.onhidden === 'function'){
    this.options.modal.onhidden();
  }
}

var _ch_sendFrameMessage = function(response){
  if(typeof response !== 'string'){
    response = JSON.stringify(response)
  }
  this.checkoutFrame.contentWindow.postMessage(response, '*');
}

// to handle absolute/relative url of options.image
var _ch_setImageOption = function(options){
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

var _ch_setMetaViewport = function(){
  if(typeof document.querySelector !== 'function'){
    return;
  }
  var head = document.querySelector('head')
  if(!head){
    return;
  }

  var meta = head.querySelector('meta[name=viewport]');

  if(meta){
    _ch_metaViewport = meta;
    meta.parentNode.removeChild(meta);
  }

  if(!_ch_metaViewportTag){
    _ch_metaViewportTag = document.createElement('meta');
    _ch_metaViewportTag.setAttribute('name', 'viewport');
    _ch_metaViewportTag.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }

  if(!_ch_metaViewportTag.parentNode){
    head.appendChild(_ch_metaViewportTag);
  }
}

var _ch_onFrameMessage = function(e, data){
  // this === rzp
  if((typeof e.origin !== 'string') || !this.checkoutFrame || this.checkoutFrame.src.indexOf(e.origin) || (data.source !== 'frame')){ // source check
    return;
  }
  var event = data.event;
  data = data.data;


  if(event === 'load'){
    var options = {};
    _ch_setMetaViewport();

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
    _ch_setImageOption(options);

    var response = {
      context: location.href,
      options: options,
      overrides: this._overrides
    }
    if(_uid){
      response.id = _uid;
    }
    return _ch_sendFrameMessage.call(this, response);
  }

  else if(event === 'redirect'){
    discreet.nextRequestRedirect(data);
  }

  else if (event === 'submit'){
    if(window.CheckoutBridge && typeof window.CheckoutBridge.onsubmit === 'function'){
      window.CheckoutBridge.onsubmit(JSON.stringify(data));
    }
  }
  
  else if (event === 'dismiss'){
    if(_ch_backdrop){
      _ch_backdrop.style.background = '';
    }
    if(typeof this.options.modal.ondismiss === 'function'){
      this.options.modal.ondismiss()
    }
  }

  else if (event === 'hidden'){
    _ch_onClose.call(this);
  }

  else if (event === 'success'){
    if(_ch_backdrop){
      _ch_backdrop.style.background = '';
    }

    if(this.checkoutFrame){
      this.checkoutFrame.setAttribute('removable', true);
    }
    var handler = this.options.handler;
    if(typeof handler === 'function'){
      setTimeout(function(){
        handler.call(null, data);
      })
    }
    track('done', data);
  } else if (event === 'fault'){
    alert("Oops! Something went wrong.");
    _ch_onClose.call(this);
    this.close();
  }
};

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var _ch_defaultPostHandler = function(data){
  var RazorPayForm = currentScript.parentElement;
  RazorPayForm.innerHTML += deserialize(data);
  RazorPayForm.submit();
}

var _ch_parseScriptOptions = function(options){
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
    _ch_parseScriptOptions(options.method);
  }
}

var _ch_addButton = function(rzp){
  var button = document.createElement('input');
  var form = currentScript.parentNode;
  button.type = 'submit';
  button.value = rzp.options.buttontext;
  button.className = 'razorpay-payment-button';
  form.appendChild(button);
  form.onsubmit = function(e){
    if(_ch_isOpen){
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
var _ch_automaticCheckoutInit = function(){
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
    _ch_parseScriptOptions(opts);
    opts.handler = _ch_defaultPostHandler;
    var rzp = new Razorpay(opts);
    _ch_addButton(rzp);
  }
}

Razorpay.prototype.open = function() {

  if(!this.options){
    return;
  }

  if(!_ch_bodyEl){
    _ch_bodyEl = document.getElementsByTagName('body')[0];
  }

  if(!_ch_bodyEl){
    setTimeout(this.open(), 100);
  }

  if(_ch_isOpen){
    return;
  }
  _ch_isOpen = true;

  _ch_bodyOverflow = _ch_bodyEl.style.overflow;
  $.addMessageListener(_ch_onFrameMessage, this);

  if(!_ch_frameContainer){
    _ch_fallbacks();
    _ch_frameContainer = document.createElement('div');
    _ch_frameContainer.className = 'razorpay-frame-container';
    var style = _ch_frameContainer.style;
    var rules = {
      zIndex: '99999',
      position: (_chAbsoluteContainer ? 'absolute' : 'fixed'),
      top: (_chAbsoluteContainer ? pageYOffset+'px' : '0'),
      height: (_chAbsoluteContainer ? Math.max(innerHeight, 455)+'px' : '100%'),
      left: '0',
      width: '100%',
      '-webkit-transition': '0.2s ease-out top'
    }
    each(rules, function(i, rule) {
      style[i] = rule;
    })
    _ch_backdrop = document.createElement('div');
    _ch_backdrop.setAttribute('style', 'min-height: '+_chBackMinHeight+'px; transition: 0.3s ease-out; -webkit-transition: 0.3s ease-out; -moz-transition: 0.3s ease-out; position: fixed; top: 0; left: 0; width: 100%; height: 100%; filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#96000000, endColorstr=#96000000);');
    _ch_frameContainer.appendChild(_ch_backdrop);
    _ch_bodyEl.appendChild(_ch_frameContainer);
  }
  if(!_chAbsoluteContainer){
    _ch_bodyEl.style.overflow = 'hidden';
  }
  _ch_frameContainer.style.display = 'block';
  try{
    // setting unsupported value throws error in IE
    _ch_backdrop.style.background = 'rgba(0,0,0,0.6)';
  } catch(e){}

  var trackerPayload;

  if(!this.checkoutFrame) {
    this.checkoutFrame = _ch_createFrame(this.options);
    _ch_frameContainer.appendChild(this.checkoutFrame);
    trackerPayload = $.clone(this._overrides);
  }
  else {
    this.checkoutFrame.style.display = 'block';
    _ch_setMetaViewport();
    _ch_sendFrameMessage.call(this, {event: 'open'});
  }
  if(trackerPayload && !trackerPayload.key.indexOf('rzp_live_')){
    _uid = this._id;
  }
  track('open', trackerPayload);
};

Razorpay.prototype.close = function(){
  if(_ch_isOpen){
    _ch_sendFrameMessage.call(this, {event: 'close'});
  }
};

discreet.validateCheckout = function(options){

  var amount = parseInt(options.amount);
  options.amount = String(options.amount);
  if (!amount || typeof amount !== 'number' || amount < 100 || options.amount.indexOf('.') !== -1) {
    var message = 'amount (Minimum amount is ₹ 1)';
    alert(message);
    return message;
  }

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
_ch_automaticCheckoutInit();