import Razorpay from 'common/Razorpay';
import { makeUrl } from 'common/helper';
import { Events, Track, MiscEvents } from 'analytics/index';
import CheckoutFrame from './frame';
import { returnAsIs } from 'lib/utils';
import BrowserStorage from 'browserstorage';
import * as _El from 'utils/DOM';
import { querySelectorAll, obj2formhtml, form2obj } from 'utils/doc';

const RazorProto = _.prototypeOf(Razorpay);

var body;
function setBody() {
  body = document.body || document.getElementsByTagName('body')[0];
  if (!body) {
    setTimeout(setBody, 99);
  }
}
setBody();

function needBody(func) {
  return function bodyInsurance() {
    if (!body) {
      setTimeout(bodyInsurance.bind(this), 99);
      return this;
    }
    return func.call(this);
  };
}

const currentScript =
  document.currentScript ||
  (function () {
    var scripts = querySelectorAll('script');
    return scripts[scripts.length - 1];
  })();

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
function defaultAutoPostHandler(data) {
  currentScript
    |> _El.parent
    |> _El.append(_El.create() |> _El.setContents(obj2formhtml(data)))
    |> _Obj.setProp('onsubmit', returnAsIs)
    |> _El.submit;
}

var addAutoCheckoutButton = function (rzp) {
  currentScript
    |> _El.parent
    |> _El.append(
      _El.create('input')
        |> _Obj.extend({
          type: 'submit',
          value: rzp.get('buttontext'),
          className: 'razorpay-payment-button',
        })
    )
    |> _Obj.setProp('onsubmit', function (e) {
      e.preventDefault();
      let form = this;
      let { action, method, target } = form;
      var options = rzp.get();
      // if data-callback_url is not passed
      if (
        // string check, because there may be an input element named "action"
        _.isString(action) &&
        action &&
        !options.callback_url
      ) {
        var request = {
          url: action,
          content: form2obj(form),
          method: _.isString(method) ? method : 'get',
          target: _.isString(target) && target,
        };

        try {
          var data = btoa(
            _Obj.stringify({
              request,
              options: _Obj.stringify(options),
              back: location.href,
            })
          );

          options.callback_url = makeUrl('checkout/onyx') + '?data=' + data;
        } catch (err) {}
      }

      rzp.open();

      Events.TrackBehav(MiscEvents.AUTOMATIC_CHECKOUT_CLICK);
      return false;
    });
};

/**
 * This checks whether we are in automatic mode
 * If yes, it puts in the button
 */
function initAutomaticCheckout() {
  var opts = {};
  _Obj.loop(currentScript.attributes, function (attr) {
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
    var form = currentScript |> _El.parent;
    opts.handler = defaultAutoPostHandler;
    var rzp = Razorpay(opts);
    if (!opts.parent) {
      Events.TrackRender(MiscEvents.AUTOMATIC_CHECKOUT_OPEN, rzp);
      addAutoCheckoutButton(rzp);
    }
  }
}

var frameContainer;
function createFrameContainer() {
  if (!frameContainer) {
    frameContainer =
      _El.create()
      |> _Obj.setProp('className', 'razorpay-container')
      |> _Obj.setProp(
        'innerHTML',
        '<style>@keyframes rzp-rot{to{transform: rotate(360deg);}}@-webkit-keyframes rzp-rot{to{-webkit-transform: rotate(360deg);}}</style>'
      )
      |> _El.setStyles({
        zIndex: 1e9,
        position: 'fixed',
        top: 0,
        display: 'none',
        left: 0,
        height: '100%',
        width: '100%',
        '-webkit-overflow-scrolling': 'touch',
        '-webkit-backface-visibility': 'hidden',
        'overflow-y': 'visible',
      })
      |> _El.appendTo(body);
    CheckoutFrame.container = frameContainer;
    var frameBackdrop = createFrameBackdrop(frameContainer);
    CheckoutFrame.backdrop = frameBackdrop;
    var testRibbon = createTestRibbon(frameBackdrop);
    CheckoutFrame.ribbon = testRibbon;
  }

  return frameContainer;
}

function createFrameBackdrop(container) {
  return (
    _El.create()
    |> _Obj.setProp('className', 'razorpay-backdrop')
    |> _El.setStyles({
      'min-height': '100%',
      transition: '0.3s ease-out',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    })
    |> _El.appendTo(container)
  );
}

function createTestRibbon(parent) {
  const rotateRule = 'rotate(45deg)';
  const animRule = 'opacity 0.3s ease-in';
  return (
    _El.create('span')
    |> _Obj.setProp('innerHTML', 'Test Mode')
    |> _El.setStyles({
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
      top: '50px',
    })
    |> _El.appendTo(parent)
  );
}

function fetchNewDesignExp(rzp) {
  let uuid = Track.makeUid();
  return new Promise(function (resolve, reject) {
    fetch.post({
      url: 'https://api.razorpay.com/v1/splitz/evaluate',
      callback: function (data) {
        resolve(data);
      },
      data: {
        id: uuid,
        experiment_id: 'JARUK3l9b4GF7f',
        request_data: JSON.stringify({
          merchant_key_id: rzp.get('key') || '',
        }),
      },
    });
  });
}

var preloadedFrame;
var preloadedFramePromise;
function getPreloadedFrame(rzp) {
  function setFrame() {
    preloadedFrame = new CheckoutFrame(rzp);
    global |> _El.on('message', preloadedFrame.onmessage.bind(preloadedFrame));
    _El.append(frameContainer, preloadedFrame.el);
  }

  if (rzp && rzp.get('one_click_checkout')) {
    rzp.set('v_1_5_experiment_enabled', false);
    preloadedFramePromise = fetchNewDesignExp(rzp).then((data) => {
      if (data?.response?.variant?.name === 'enable_1_5') {
        rzp.set('v_1_5_experiment_enabled', true);
      }
      const currentFrames = document.getElementsByClassName(
        'razorpay-checkout-frame'
      );
      while (currentFrames.length) {
        currentFrames[0].remove();
      }
      setFrame();
      intialInstrumentation(rzp, preloadedFrame);
      return preloadedFrame;
    });

    if (preloadedFrame && preloadedFrame.openRzp) {
      preloadedFrame.openRzp(rzp);
    } else {
      preloadedFramePromise = new Promise(function (resolve, reject) {
        setFrame();
        resolve(preloadedFrame);
      });
    }
  } else {
    if (preloadedFramePromise) {
      preloadedFramePromise.then(() => {
        if (rzp) {
          preloadedFrame.openRzp(rzp);
        }
      });
      return preloadedFrame;
    }
    preloadedFramePromise = new Promise(function (resolve, reject) {
      setFrame();
      resolve(preloadedFrame);
    });
  }
  return preloadedFrame;
}

Razorpay.open = function (options) {
  return Razorpay(options).open();
};

RazorProto.postInit = function () {
  this.modal = { options: {} };

  if (this.get('parent')) {
    this.open();
  }
};

var onNew = RazorProto.onNew;

RazorProto.onNew = function (event, callback) {
  if (event === 'payment.error') {
    Track(this, 'event_paymenterror', location.href);
  }
  if (_.isFunction(onNew)) {
    onNew.call(this, event, callback);
  }
};

function intialInstrumentation(that, checkoutFrame) {
  var frame = (that.checkoutFrame = checkoutFrame);
  Track(that, 'open', {
    v_1_5_experiment_enabled: that.get('v_1_5_experiment_enabled') || false,
  });

  if (!frame.el.contentWindow) {
    frame.close();
    frame.afterClose();
    global.alert(
      'This browser is not supported.\nPlease try payment in another browser.'
    );
  }

  if (currentScript.src.slice(-7) === '-new.js') {
    Track(that, 'oldscript', location.href);
  }
}

RazorProto.open = needBody(function () {
  if (!this.metadata) {
    this.metadata = {};
  }
  this.metadata.openedAt = Date.now();
  var checkoutFrame = getPreloadedFrame(this);
  var that = this;

  if (checkoutFrame && !that?.get('one_click_checkout')) {
    intialInstrumentation(that, checkoutFrame);
  }

  return this;
});

/**
 * Resumes the payment.
 * Invokes `payment.resume` on the frame.
 * @param {Object} data
 */
RazorProto.resume = function (data) {
  const frame = this.checkoutFrame;

  if (frame) {
    frame.postMessage({
      event: 'resume',
      data,
    });
  }
};

RazorProto.close = function () {
  var frame = this.checkoutFrame;
  if (frame) {
    frame.postMessage({ event: 'close' });
  }
};

var initRazorpayCheckout = needBody(function () {
  createFrameContainer();

  /**
   * On Safari, we do not want to preload the iframe.
   * Because every time a user visits a page with the
   * Razorpay iframe on it, it counts towards one day
   * on the LocalStorage counter.
   *
   * More details:
   * https://docs.google.com/document/d/1DSqQ2w70pepJFsf2roQmvRrWaYFaWOLinwcIonfoWQI/edit?usp=sharing
   */
  // if (!Safari) {
  preloadedFrame = getPreloadedFrame();
  // }

  // Get the ball rolling in case we are in manual mode
  try {
    initAutomaticCheckout();
  } catch (e) {}
});

export default initRazorpayCheckout;
