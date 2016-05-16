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

var addAutoCheckoutButton = function(rzp){
  var button = document.createElement('input');
  var form = currentScript.parentElement;
  button.type = 'submit';
  button.value = rzp.get('buttontext');
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
        var val = attr.value;
        if(val === 'true'){
          val = true;
        } else if (val === 'false'){
          val = false;
        }
        opts[name] = val;
      }
    }
  )

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
  backdrop.className = 'razorpay-backdrop anim';
  backdrop.innerHTML = "<style>@keyframes rzp-rot{to{transform: rotate(360deg);}}.razorpay-backdrop.anim:after{content:'';position:absolute;left:50%;top:50%;margin:-1.5em 0 0 -1.5em;height:3em;width:3em;animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;}</style>";
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

function createTestRibbon(){
  var ribbon = document.createElement('span');
  ribbon.target = '_blank';
  ribbon.href = '';
  ribbon.innerHTML = 'Test Mode';
  var style = ribbon.style;
  var animRule = 'opacity 0.3s ease-in';
  var rotateRule = 'rotate(45deg)';
  each(
    {
      'text-decoration': 'none',
      'background': '#D64444',
      'border': '1px dashed white',
      'padding': '3px',
      'opacity': '0',
      '-webkit-transform': rotateRule,
      '-moz-transform': rotateRule,
      '-ms-transform': rotateRule,
      '-o-transform': rotateRule,
      'transform': rotateRule,
      '-webkit-transition': animRule,
      '-moz-transition': animRule,
      'transition': animRule,
      'font-family': 'lato,ubuntu,helvetica,sans-serif',
      'color': 'white',
      'position': 'absolute',
      'width': '200px',
      'text-align': 'center',
      'right': '-50px',
      'top': '50px'
    },
    function(ruleKey, value){
      style[ruleKey] = value;
    }
  )
  frameBackdrop.appendChild(ribbon);
  return ribbon;
}

var frameContainer = createFrameContainer();
var frameBackdrop = createFrameBackdrop();
var testRibbon = createTestRibbon();
var preloadedFrame;// = getPreloadedFrame();

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
  if(!this.get('redirect') && !discreet.supported(true)){
    return;
  }

  if(!preloadedFrame){
    // if(this.get('parent')){
      preloadedFrame = new CheckoutFrame(this);
    // }
    // else {
    //   frame = getPreloadedFrame();
    // }
  }
  this.checkoutFrame = preloadedFrame;

  if(preloadedFrame.hasLoaded){
    preloadedFrame.openRzp(this);
  }

  if(!preloadedFrame.el.contentWindow){
    preloadedFrame.close();
    preloadedFrame.afterClose();
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

// Get the ball rolling in case we are in manual mode
initAutomaticCheckout();
