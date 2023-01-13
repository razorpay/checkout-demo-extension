import Razorpay from 'common/Razorpay';
import { makeUrl } from 'common/helper';
import { Events, Track, MiscEvents, MetaProperties } from 'analytics/index';
import CheckoutFrame from './frame';
import { returnAsIs } from 'lib/utils';
import * as _El from 'utils/DOM';
import { querySelectorAll, form2obj } from 'utils/doc';
import getAffordabilityWidgetFingerprint from 'utils/affordabilityWidgetFingerprint';
import { isBraveBrowser, isMobile } from 'common/useragent';
import { detectIncognito } from 'detectincognitojs';
import { appendFormInput, flatten } from 'common/form';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import Interface from 'common/interface';
import { MiscTracker } from 'misc/analytics/events';
import { getOption, hasCart } from 'razorpay';
import type { Razorpay as RazorpayType } from 'types/types';
import type { OptionObject } from 'razorpay/types/Options';
import { subscribeToTruecallerEvent } from 'truecaller/subscriptions';
import MetaPropertiesOneCC from '../one_click_checkout/analytics/metaProperties';
// import { setupFreezeCheck } from './freeze';

const RazorProto = _.prototypeOf(Razorpay);

let body: HTMLElement;
function setBody() {
  body = document.body || document.getElementsByTagName('body')[0];
  if (!body) {
    setTimeout(setBody, 99);
  }
}
setBody();

function needBody(func: () => void) {
  return function bodyInsurance(this: RazorpayType) {
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
    const scripts = querySelectorAll('script');
    return scripts[scripts.length - 1];
  })();

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
function defaultAutoPostHandler(data: Record<string, any>) {
  const form = _El.parent(currentScript) as HTMLFormElement;
  appendFormInput({ form, data: flatten(data) });
  form['onsubmit'] = returnAsIs;
  form.submit();
}

const addAutoCheckoutButton = function (rzp: RazorpayType) {
  const parent = _El.parent(currentScript) as HTMLFormElement;
  const appendNode = _El.append(
    parent,
    Object.assign(_El.create('input'), {
      type: 'submit',
      value: rzp.get('buttontext'),
      className: 'razorpay-payment-button',
    })
  ) as HTMLFormElement;
  appendNode['onsubmit'] = function (e: Event) {
    e.preventDefault();
    const form = this as HTMLFormElement;
    const { action, method, target } = form;
    const options = rzp.get();
    // if data-callback_url is not passed
    if (
      // string check, because there may be an input element named "action"
      _.isString(action) &&
      action &&
      !options.callback_url
    ) {
      const request = {
        url: action,
        content: form2obj(form),
        method: _.isString(method) ? method : 'get',
        target: _.isString(target) && target,
      };

      try {
        const data = btoa(
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
  const opts: Record<string, any> = {};
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

  const key = opts.key;
  if (key && key.length > 0) {
    // passing form action as callback_url
    // var form = _El.parent(currentScript);
    opts.handler = defaultAutoPostHandler;
    const rzp = Razorpay(opts);
    if (!opts.parent) {
      Events.TrackRender(MiscEvents.AUTOMATIC_CHECKOUT_OPEN, rzp as any);
      addAutoCheckoutButton(rzp as unknown as RazorpayType);
    }
  }
}

let frameContainer: HTMLDivElement;
function createFrameContainer() {
  if (!frameContainer) {
    const frameContainerElement = _El.create() as HTMLDivElement;
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
    frameContainer = _El.appendTo(
      frameContainerElement,
      body
    ) as HTMLDivElement;
    // TODO update checkout frame type
    (CheckoutFrame as any).container = frameContainer;
    const frameBackdrop = createFrameBackdrop(frameContainer);
    // TODO update checkout frame type
    (CheckoutFrame as any).backdrop = frameBackdrop;
    const testRibbon = createTestRibbon(frameBackdrop);
    // TODO update checkout frame type
    (CheckoutFrame as any).ribbon = testRibbon;
  }

  return frameContainer;
}

function createFrameBackdrop(container: HTMLDivElement) {
  const backDropDiv = _El.create() as HTMLDivElement;
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
  return _El.appendTo(backDropDiv, container) as HTMLDivElement;
}

function createTestRibbon(parent: HTMLDivElement) {
  const rotateRule = 'rotate(45deg)';
  const animRule = 'opacity 0.3s ease-in';
  const ribbonElement = _El.create('span') as HTMLSpanElement;
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
  return _El.appendTo(ribbonElement, parent) as HTMLSpanElement;
}

let preloadedFrame: CheckoutFrame;
let isBrave = false;
let isPrivate = false;
const affordabilityWidgetFid = getAffordabilityWidgetFingerprint();
/**
 * in iframe isBraveBrowser doesn't work as expected to make sure we detect brave browser
 * we are moving check of isBraveBrowser to checkout.js and pass isBrave flag
 * via meta property using postmessage
 */
isBraveBrowser().then((r) => {
  isBrave = r;
});

detectIncognito()
  .then((result) => {
    isPrivate = result.isPrivate;
  })
  .catch(() => {
    // no-op
  });

function getPreloadedFrame(rzp?: RazorpayType) {
  if (preloadedFrame) {
    preloadedFrame.openRzp(rzp);
  } else {
    preloadedFrame = new CheckoutFrame(rzp);
    // TODO update type of preloadedFrame
    Interface.iframeReference = (preloadedFrame as any).el;
    Interface.setId(Track.id);
    const cb = preloadedFrame.onmessage.bind(preloadedFrame);
    _El.on('message', cb)?.(global);
    _El.append(frameContainer, (preloadedFrame as any).el);
  }

  return preloadedFrame;
}

// TODO update type
(Razorpay as any).open = function (options: OptionObject) {
  return (Razorpay(options) as any).open();
};

RazorProto.postInit = function () {
  this.modal = { options: {} };
  const baseSet = this.set;
  this.set = (key: string, value: unknown) => {
    const frame = this.checkoutFrame;
    if (frame) {
      frame.postMessage({ event: 'update_options', data: { [key]: value } });
    }
    baseSet(key, value);
  };

  if (this.get('parent')) {
    this.open();
  }
};

const onNew = RazorProto.onNew;

RazorProto.onNew = function (event: string, callback: (data: unknown) => void) {
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

RazorProto.createCheckoutAndFetchPrefs = function (reqbody: unknown) {
  // for 1cc shopify
  if (!preloadedFrame) {
    // this event is used to determine whether to trigger standard open flow
    this.emit('shopify_failure');
    return;
  }
  preloadedFrame.makeCheckoutCallForShopify(this, reqbody);
};

RazorProto.open = needBody(function (this: RazorpayType) {
  if (!this.metadata) {
    this.metadata = {
      isBrave,
      isPrivate,
    };
    if (affordabilityWidgetFid) {
      this.metadata['affordability_widget_fid'] = affordabilityWidgetFid;
    }
  }
  this.metadata.openedAt = Date.now();

  const frame = (this.checkoutFrame = getPreloadedFrame(this));

  Events.setMeta(
    MetaPropertiesOneCC.IS_ONE_CLICK_CHECKOUT_LITE,
    hasCart() && !getOption('order_id')
  );
  Events.Track(MiscEvents.OPEN);

  try {
    MiscTracker.INVOKED({
      prefill: {
        contact: getOption('prefill.contact'),
        email: getOption('prefill.email'),
        method: getOption('prefill.method') || '',
      },
    });
  } catch {}

  // setupFreezeCheck();

  // TODO update type
  if (!(frame as any).el.contentWindow) {
    frame.close();
    frame.afterClose();
    global.alert(
      'This browser is not supported.\nPlease try payment in another browser.'
    );
  }

  if ((currentScript as HTMLScriptElement).src.slice(-7) === '-new.js') {
    Track(this, 'oldscript', location.href);
  }

  return this;
});

/**
 * Resumes the payment.
 * Invokes `payment.resume` on the frame.
 * @param {Object} data
 */
RazorProto.resume = function (data: Record<string, any>) {
  const frame = this.checkoutFrame;

  if (frame) {
    frame.postMessage({
      event: 'resume',
      data,
    });
  }
};

RazorProto.close = function () {
  const frame = this.checkoutFrame;
  if (frame) {
    frame.postMessage({ event: 'close' });
  }
};

const initRazorpayCheckout = needBody(function () {
  Events.setMeta(MetaProperties.IS_MOBILE, isMobile());

  createFrameContainer();

  if (window.Intl) {
    preloadedFrame = getPreloadedFrame();
  } else {
    Events.Track(MiscEvents.INTL_MISSING);
  }

  subscribeToTruecallerEvent();

  // Get the ball rolling in case we are in manual mode
  try {
    initAutomaticCheckout();
  } catch (e) {}
});

export default initRazorpayCheckout;
