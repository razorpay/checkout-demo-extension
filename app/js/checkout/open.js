// flag for checkout-js
discreet.isCheckout = true;
var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

var communicator;

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var defaultAutoPostHandler = function(data){
  var RazorPayForm = currentScript.parentNode;
  var div = document.createElement('div');
  div.innerHTML = deserialize(data);
  RazorPayForm.appendChild(div);
  RazorPayForm.onsubmit = noop;
  RazorPayForm.submit();
}

var parseScriptOptions = function(options){
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
    parseScriptOptions(options.method);
  }
}

var addAutoCheckoutButton = function(rzp){
  var button = document.createElement('input');
  var form = currentScript.parentElement;
  button.type = 'submit';
  button.value = rzp.options.buttontext;
  button.className = 'razorpay-payment-button';
  form.appendChild(button);
  form.onsubmit = function(e){
    e.preventDefault();
    rzp.open();
    return false;
  }
}

/**
* This checks whether we are in automatic mode
* If yes, it puts in the button
*/
function initAutomaticCheckout(){
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

  parseScriptOptions(opts);
  var amount = currentScript.getAttribute('data-amount');

  if (amount && amount.length > 0){
    opts.handler = defaultAutoPostHandler;
    addAutoCheckoutButton(Razorpay(opts));
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
var preloadedFrame = getPreloadedFrame();

function getPreloadedFrame(){

  if(!preloadedFrame && discreet.supported()){
    preloadedFrame = new CheckoutFrame();
    preloadedFrame.bind();
    frameContainer.appendChild(preloadedFrame.el);
  }
  return preloadedFrame;
}

Razorpay.open = function(options) {
  return Razorpay(options).open();
}

Razorpay.prototype.open = function() {
  if(!this.options.redirect && !discreet.supported(true)){
    return;
  }

  var frame = this.checkoutFrame;
  if(!frame){
    if(this.options.parent){
      frame = new CheckoutFrame(this);
    }
    else {
      frame = getPreloadedFrame();
    }
    this.checkoutFrame = frame;
  }
  if(!frame.embedded){
    frame.openRzp(this);
  }

  if(!frame.el.contentWindow){
    frame.close();
    frame.afterClose();
    alert('This browser is not supported.\nPlease try payment in another browser.');
  }

  return this;
};

Razorpay.prototype.close = function(){
  var frame = this.checkoutFrame;
  if(frame){
    frame.postMessage({event: 'close'});
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
initAutomaticCheckout();
