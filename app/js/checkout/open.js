// flag for checkout-js
discreet.isCheckout = true;

var currentScript =
  document.currentScript ||
  (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var defaultAutoPostHandler = function(data) {
  var RazorPayForm = currentScript.parentNode;
  var div = document.createElement('div');
  div.innerHTML = deserialize(data);
  RazorPayForm.appendChild(div);
  RazorPayForm.onsubmit = noop;
  RazorPayForm.submit();
};

var addAutoCheckoutButton = function(rzp) {
  var button = document.createElement('input');
  var form = currentScript.parentElement;
  button.type = 'submit';
  button.value = rzp.get('buttontext');
  button.className = 'razorpay-payment-button';
  form.appendChild(button);
  form.onsubmit = function(e) {
    e.preventDefault();

    var formAction = form.action;
    var options = rzp.get();
    // if data-callback_url is not passed
    if (
      isString(formAction) &&
      formAction &&
      !options.callback_url &&
      window.btoa
    ) {
      var content = {};
      each($(form).find('[name]'), function(index, el) {
        content[el.name] = el.value;
      });

      var request = {
        url: formAction
      };
      if (form.method === 'post') {
        request.method = 'post';
      }
      var target = form.target;
      if (target && isString(target)) {
        request.target = form.target;
      }

      if (Object.keys(content).length) {
        request.content = content;
      }

      try {
        var data = btoa(
          stringify({
            request: request,
            options: stringify(options),
            back: location.href
          })
        );

        options.callback_url = makeUrl('checkout/onyx') + '?data=' + data;
      } catch (err) {}
    }
    rzp.open();
    return false;
  };
};

/**
 * This checks whether we are in automatic mode
 * If yes, it puts in the button
 */
function initAutomaticCheckout() {
  var opts = {};
  each(currentScript.attributes, function(i, attr) {
    var name = attr.name.toLowerCase();
    if (/^data-/.test(name)) {
      var rootObj = opts;
      name = name.replace(/^data-/, '');
      var val = attr.value;
      if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      }
      if (/^notes\./.test(name)) {
        if (!opts.notes) {
          opts.notes = {};
        }
        rootObj = opts.notes;
        name = name.replace(/^notes\./, '');
      }
      rootObj[name] = val;
    }
  });

  var key = opts.key;
  if (key && key.length > 0) {
    // passing form action as callback_url
    var form = currentScript.parentElement;
    var formAction = form.action;

    opts.handler = defaultAutoPostHandler;
    var rzp = Razorpay(opts);
    if (!opts.parent) {
      addAutoCheckoutButton(rzp);
    }
  }
}

function createFrameContainer() {
  var div = document.createElement('div');
  div.className = 'razorpay-container';
  div.innerHTML =
    '<style>@keyframes rzp-rot{to{transform: rotate(360deg);}}@-webkit-keyframes rzp-rot{to{-webkit-transform: rotate(360deg);}}</style>';
  var style = div.style;
  var rules = {
    zIndex: 1e9,
    position: 'fixed',
    top: 0,
    display: 'none',
    left: 0,
    height: '100%',
    width: '100%',
    '-webkit-overflow-scrolling': 'touch',
    '-webkit-backface-visibility': 'hidden',
    'overflow-y': 'visible'
  };
  each(rules, function(i, rule) {
    style[i] = rule;
  });
  body.appendChild(div);
  return div;
}

function createFrameBackdrop() {
  var backdrop = document.createElement('div');
  backdrop.className = 'razorpay-backdrop';
  var style = backdrop.style;
  each(
    {
      'min-height': '100%',
      transition: '0.3s ease-out',
      '-webkit-transition': '0.3s ease-out',
      '-moz-transition': '0.3s ease-out',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      filter:
        'progid:DXImageTransform.Microsoft.gradient(startColorstr=#96000000, endColorstr=#96000000)'
    },
    function(ruleKey, value) {
      style[ruleKey] = value;
    }
  );
  frameContainer.appendChild(backdrop);
  return backdrop;
}

function createTestRibbon() {
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
      background: '#D64444',
      border: '1px dashed white',
      padding: '3px',
      opacity: '0',
      '-webkit-transform': rotateRule,
      '-moz-transform': rotateRule,
      '-ms-transform': rotateRule,
      '-o-transform': rotateRule,
      transform: rotateRule,
      '-webkit-transition': animRule,
      '-moz-transition': animRule,
      transition: animRule,
      'font-family': 'lato,ubuntu,helvetica,sans-serif',
      color: 'white',
      position: 'absolute',
      width: '200px',
      'text-align': 'center',
      right: '-50px',
      top: '50px'
    },
    function(ruleKey, value) {
      style[ruleKey] = value;
    }
  );
  frameBackdrop.appendChild(ribbon);
  return ribbon;
}

var frameContainer, frameBackdrop, testRibbon, preloadedFrame;

function getPreloadedFrame(rzp) {
  if (preloadedFrame) {
    preloadedFrame.openRzp(rzp);
  } else {
    preloadedFrame = new CheckoutFrame(rzp);
    $(window).on('message', bind('onmessage', preloadedFrame));
    frameContainer.appendChild(preloadedFrame.el);
  }
  return preloadedFrame;
}

Razorpay.open = function(options) {
  return Razorpay(options).open();
};

RazorProto.postInit = function() {
  this.modal = { options: emo };
  // this.options = emo;

  if (this.get('parent')) {
    this.open();
  }
};

var onNew = RazorProto.onNew;

RazorProto.onNew = function(event, callback) {
  if (event === 'payment.error') {
    track(this, 'event_paymenterror', location.href);
  }
  if (isFunction(onNew)) {
    onNew.call(this, event, callback);
  }
};

RazorProto.open = needBody(function() {
  var frame = (this.checkoutFrame = getPreloadedFrame(this));
  track(this, 'open');

  if (!frame.el.contentWindow) {
    frame.close();
    frame.afterClose();
    alert(
      'This browser is not supported.\nPlease try payment in another browser.'
    );
  }

  if (currentScript.src.slice(-7) === '-new.js') {
    track(this, 'oldscript', location.href);
  }

  return this;
});

RazorProto.close = function() {
  var frame = this.checkoutFrame;
  if (frame) {
    frame.postMessage({ event: 'close' });
  }
};

var initRazorpayCheckout = needBody(function() {
  frameContainer = createFrameContainer();
  frameBackdrop = createFrameBackdrop();
  testRibbon = createTestRibbon();
  preloadedFrame = getPreloadedFrame();
  // Get the ball rolling in case we are in manual mode
  try {
    initAutomaticCheckout();
  } catch (e) {}
});
initRazorpayCheckout();
