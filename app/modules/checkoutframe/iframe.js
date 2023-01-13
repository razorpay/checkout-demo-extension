import { handleMessage } from 'checkoutframe/index';
import * as Bridge from 'bridge';
import Razorpay from 'common/Razorpay';
import { ownerWindow } from 'common/constants';
import Analytics, { Track, MetaProperties } from 'analytics';
import { getSession } from 'sessionmanager';
import { defineGlobals as defineGlobalsForBridge } from 'bridge/global';
import { parse } from 'utils/object';
import * as _El from 'utils/DOM';
import { body } from 'utils/doc';
import * as _ from 'utils/_';
import { captureSentryHttpFailure } from 'sentry/failure';
import { isMobile } from 'common/useragent';

/**
 * This handles methods of the new iOS SDK Bridge.
 * @param  {String} method name of iOS bridge method to be invoked
 * @param  {any}    data   Extra data to be sent to the method
 */
function handleNewIOSMethods(method, data) {
  let color = {
    /**
     * Currently can't set theme color as it's not available onload
     * TODO: Set color in whenever available after discussing with iOS team
     **/
    theme: null,
    navShow: { red: 0, green: 0, blue: 0, alpha: 0.5 },
    navHide: { red: 1, green: 1, blue: 1, alpha: 1 },
  };
  try {
    data = JSON.parse(data);
  } catch (e) {}

  data = data || {};

  let navData;

  switch (method) {
    case 'load':
      navData = {
        webview_background_color: color.navHide,
      };
      Bridge.checkout.callIos('hide_nav_bar', navData);
      //add theme color
      data.theme_color = color.theme;
      Bridge.checkout.callIos(method, data); //default load
      break;
    case 'submit':
      Bridge.checkout.callIos(method, data); //send default submit
      navData = {
        webview_background_color: color.navShow,
      };
      Bridge.checkout.callIos('show_nav_bar', navData);
      break;
    default:
      Bridge.checkout.callIos(method, data);
  }
}

const platformSpecific = {
  ios: () => {
    /* TODO: define this only in older iOS SDKs, directly call new iOS Bridge
     * from notify Bridge for newer SDKs */
    let CheckoutBridge = Bridge.defineIosBridge();
    let bridgeMethods = ['load', 'dismiss', 'submit', 'fault', 'success'];

    bridgeMethods.forEach((prop) => {
      let method;

      if (Bridge.hasNewIosBridge()) {
        method = (data) => {
          handleNewIOSMethods(prop, data);
        };
      } else {
        method = Bridge.iosLegacyMethod(prop);
      }

      CheckoutBridge['on' + prop] = method;
    });

    CheckoutBridge.oncomplete = CheckoutBridge.onsuccess;
  },

  android: () => {
    _El.setStyles(body, { background: 'rgba(0, 0, 0, 0.6)' });
  },
};

const flush = () => Razorpay.sendMessage({ event: 'flush' });

export function initIframe() {
  const parseMessage = (e) => {
    /* not concerned about adding/removing listeners,
     * iframe is razorpay's fiefdom */
    let data = e.data;
    const session = getSession();
    const iframeFlow = session?.r?._payment?.forceIframeElement || {};
    if (
      e.source &&
      e.source !== ownerWindow &&
      e.source !== iframeFlow?.contentWindow
    ) {
      return;
    }

    try {
      if (typeof data === 'string') {
        data = parse(data) || {};
      }
      handleMessage(data);
    } catch (err) {}
  };

  _El.on('message', parseMessage)(window);

  _El.on('blur', flush)(window);

  _El.on('beforeunload', () => {
    const session = getSession();

    /**
     * If the user navigates away from the current website
     * while Checkout is still open, track it
     */
    if (session && session.isOpen) {
      Analytics.track('modal:close', {
        data: {
          navigation: true,
        },
        immediately: true,
      });
    }

    flush();
  })(window);

  window.addEventListener('sentry_http_failure', captureSentryHttpFailure);

  defineGlobalsForBridge();

  const qpmap = _.getQueryParams();
  const platform = qpmap.platform;

  if (platform) {
    _El.addClass(body, platform);

    const platformFn = platformSpecific[platform];

    if (_.isFunction(platformFn)) {
      platformFn();
    }
  }

  if (Bridge.hasCheckoutBridge()) {
    delete Track.props.referer;
    Track.props.platform = 'mobile_sdk';

    let os = qpmap.platform;
    if (os) {
      Track.props.os = os;
    }
  }

  if (qpmap.message) {
    parseMessage({ data: global.atob(qpmap.message) });
  }

  // adding origin as this event can now be triggered from captcha script also
  Razorpay.sendMessage({ event: 'load', data: { origin: 'checkout-frame' } });

  const INIT_TIME = Date.now();
  Analytics.setMeta(
    MetaProperties.TIME_SINCE_INIT_IFRAME,
    () => Date.now() - INIT_TIME
  );
  Analytics.setMeta(MetaProperties.IS_MOBILE, isMobile());
}
