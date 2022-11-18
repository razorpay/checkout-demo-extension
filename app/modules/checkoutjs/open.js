import Razorpay from 'common/Razorpay';
import { makeUrl } from 'common/helper';
import { Events, Track, MiscEvents } from 'analytics/index';
import CheckoutFrame from './frame';
import { returnAsIs } from 'lib/utils';
import * as _El from 'utils/DOM';
import { querySelectorAll, form2obj } from 'utils/doc';
import getAffordabilityWidgetFingerprint from 'utils/affordabilityWidgetFingerprint';
import { isBraveBrowser } from 'common/useragent';
import { appendFormInput, flatten } from 'common/form';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import Interface from 'common/interface';
import { ContextProperties, EventsV2 } from 'analytics-v2';
import { shouldUseVernacular } from 'checkoutstore/methods';
import { getValidLocaleFromConfig, getValidLocaleFromStorage } from 'i18n/init';
import { MiscTracker } from 'misc/analytics/events';
import { getOption } from 'razorpay';
// import { setupFreezeCheck } from './freeze';

const RazorProto = _.prototypeOf(Razorpay);

let body;
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
    let scripts = querySelectorAll('script');
    return scripts[scripts.length - 1];
  })();

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
function defaultAutoPostHandler(data) {
  const form = _El.parent(currentScript);
  appendFormInput({ form, data: flatten(data) });
  form['onsubmit'] = returnAsIs;
  form.submit();
}

let addAutoCheckoutButton = function (rzp) {
  const parent = _El.parent(currentScript);
  const appendNode = _El.append(
    parent,
    Object.assign(_El.create('input'), {
      type: 'submit',
      value: rzp.get('buttontext'),
      className: 'razorpay-payment-button',
    })
  );
  appendNode['onsubmit'] = function (e) {
    e.preventDefault();
    let form = this;
    let { action, method, target } = form;
    let options = rzp.get();
    // if data-callback_url is not passed
    if (
      // string check, because there may be an input element named "action"
      _.isString(action) &&
      action &&
      !options.callback_url
    ) {
      let request = {
        url: action,
        content: form2obj(form),
        method: _.isString(method) ? method : 'get',
        target: _.isString(target) && target,
      };

      try {
        let data = btoa(
          JSON.stringify({
            request,
            options: JSON.stringify(options),
            back: location.href,
          })
        );

        options.callback_url = makeUrl('checkout/onyx') + '?data=' + data;
      } catch (err) {}
    }

    rzp.open();

    Events.TrackBehav(MiscEvents.AUTOMATIC_CHECKOUT_CLICK);
    return false;
  };
};

/**
 * This checks whether we are in automatic mode
 * If yes, it puts in the button
 */
function initAutomaticCheckout() {
  let opts = {};
  ObjectUtils.loop(currentScript.attributes, function (attr) {
    let name = attr.name.toLowerCase();
    if (/^data-/.test(name)) {
      let rootObj = opts;
      name = name.replace(/^data-/, '');
      let val = attr.value;
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

  let key = opts.key;
  if (key && key.length > 0) {
    // passing form action as callback_url
    // var form = _El.parent(currentScript);
    opts.handler = defaultAutoPostHandler;
    let rzp = Razorpay(opts);
    if (!opts.parent) {
      Events.TrackRender(MiscEvents.AUTOMATIC_CHECKOUT_OPEN, rzp);
      addAutoCheckoutButton(rzp);
    }
  }
}

let frameContainer;
function createFrameContainer() {
  if (!frameContainer) {
    const frameContainerElement = _El.create();
    frameContainerElement.className = 'razorpay-container';
    _El.setContents(
      frameContainerElement,
      '<style>@keyframes rzp-rot{to{transform: rotate(360deg);}}@-webkit-keyframes rzp-rot{to{-webkit-transform: rotate(360deg);}}</style>'
    );
    _El.setStyles(frameContainerElement, {
      zIndex: 2147483647,
      position: 'fixed',
      top: 0,
      display: 'none',
      left: 0,
      height: '100%',
      width: '100%',
      '-webkit-overflow-scrolling': 'touch',
      '-webkit-backface-visibility': 'hidden',
      'overflow-y': 'visible',
    });
    frameContainer = _El.appendTo(frameContainerElement, body);
    CheckoutFrame.container = frameContainer;
    let frameBackdrop = createFrameBackdrop(frameContainer);
    CheckoutFrame.backdrop = frameBackdrop;
    let testRibbon = createTestRibbon(frameBackdrop);
    CheckoutFrame.ribbon = testRibbon;
  }

  return frameContainer;
}

function createFrameBackdrop(container) {
  const backDropDiv = _El.create();
  backDropDiv.className = 'razorpay-backdrop';
  const backdropStyle = {
    'min-height': '100%',
    transition: '0.3s ease-out',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };
  _El.setStyles(backDropDiv, backdropStyle);
  return _El.appendTo(backDropDiv, container);
}

function createTestRibbon(parent) {
  const rotateRule = 'rotate(45deg)';
  const animRule = 'opacity 0.3s ease-in';
  const ribbonElement = _El.create('span');
  ribbonElement.textContent = 'Test Mode';
  _El.setStyles(ribbonElement, {
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
  });
  return _El.appendTo(ribbonElement, parent);
}

let preloadedFrame;
let isBrave = false;
const affordabilityWidgetFid = getAffordabilityWidgetFingerprint();
/**
 * in iframe isBraveBrowser doesn't work as expected to make sure we detect brave browser
 * we are moving check of isBraveBrowser to checkout.js and pass isBrave flag
 * via meta property using postmessage
 */
isBraveBrowser().then((r) => {
  isBrave = r;
});
function getPreloadedFrame(rzp) {
  if (preloadedFrame) {
    preloadedFrame.openRzp(rzp);
  } else {
    preloadedFrame = new CheckoutFrame(rzp);
    Interface.iframeReference = preloadedFrame.el;
    Interface.setId(Track.id);
    _El.on('message', preloadedFrame.onmessage.bind(preloadedFrame))(global);
    _El.append(frameContainer, preloadedFrame.el);
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

let onNew = RazorProto.onNew;

RazorProto.onNew = function (event, callback) {
  if (event === 'payment.error') {
    Track(this, 'event_paymenterror', location.href);
  }
  if (_.isFunction(onNew)) {
    onNew.call(this, event, callback);
  }
};

RazorProto.initAndPrefetchPrefs = function () {
  preloadedFrame.prefetchPrefs(this);
  return this;
};

RazorProto.createCheckoutAndFetchPrefs = function (reqbody) {
  // for 1cc shopify
  if (!preloadedFrame) {
    // this event is used to determine whether to trigger standard open flow
    this.emit('shopify_failure');
    return;
  }
  preloadedFrame.makeCheckoutCallForShopify(this, reqbody);
};

RazorProto.open = needBody(function () {
  if (!this.metadata) {
    this.metadata = {
      isBrave,
    };
    if (affordabilityWidgetFid) {
      this.metadata['affordability_widget_fid'] = affordabilityWidgetFid;
    }
  }
  this.metadata.openedAt = Date.now();

  let frame = (this.checkoutFrame = getPreloadedFrame(this));
  Track(this, 'open');
  try {
    MiscTracker.INVOKED({
      prefill: {
        contact: getOption('prefill.contact'),
        email: getOption('prefill.email'),
        method: getOption('prefll.method') || '',
      },
    });
  } catch {}
  const isVernacularEnabled = shouldUseVernacular();
  let initialLocale;
  if (isVernacularEnabled) {
    initialLocale =
      getValidLocaleFromStorage() || getValidLocaleFromConfig() || 'en';
  }
  EventsV2.setContext(ContextProperties.LOCALE, initialLocale);

  // setupFreezeCheck();

  if (!frame.el.contentWindow) {
    frame.close();
    frame.afterClose();
    global.alert(
      'This browser is not supported.\nPlease try payment in another browser.'
    );
  }

  if (currentScript.src.slice(-7) === '-new.js') {
    Track(this, 'oldscript', location.href);
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
  let frame = this.checkoutFrame;
  if (frame) {
    frame.postMessage({ event: 'close' });
  }
};

let initRazorpayCheckout = needBody(function () {
  createFrameContainer();

  if (window.Intl) {
    preloadedFrame = getPreloadedFrame();
  } else {
    Events.Track(MiscEvents.INTL_MISSING);
  }

  // Get the ball rolling in case we are in manual mode
  try {
    initAutomaticCheckout();
  } catch (e) {}
});

Razorpay.fetchPreferencesLite = function ({
  key_id,
  flush_cache = false,
  currency = 'INR',
}) {
  if (preloadedFrame) {
    preloadedFrame.postMessage({
      event: 'fetch_preferences_lite',
      extra: {
        key_id,
        flush_cache,
        currency,
      },
    });
  }
};

export default initRazorpayCheckout;
