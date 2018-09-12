import { handleMessage } from 'checkoutframe/index';
import * as Bridge from 'bridge';
import Razorpay from 'common/Razorpay';
import { ownerWindow } from 'common/constants';
import Track from 'tracker';

/**
 * This handles methods of the new iOS SDK Bridge.
 * @param  {String} method name of iOS bridge method to be invoked
 * @param  {Any}    data   Extra data to be sent to the method
 */
function handleNewIOSMethods(method, data) {
  var color = {
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

  var navData;

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
    var bridgeMethods = ['load', 'dismiss', 'submit', 'fault', 'success'];

    bridgeMethods
      |> _Arr.loop(prop => {
        let method;

        if (Bridge.hasNewIosBridge()) {
          method = data => {
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
    _Doc.body
      |> _El.setStyles({
        background: 'rgba(0, 0, 0, 0.6)',
      });
  },
};

export function initIframe() {
  const parseMessage = e => {
    /* not concerned about adding/removing listeners,
     * iframe is razorpay's fiefdom */
    var data = e.data;
    if (e.source && e.source !== ownerWindow) {
      return;
    }

    try {
      if (typeof data === 'string') {
        data = _Obj.parse(data);
      }
      handleMessage(data);
    } catch (err) {
      // roll('message: ' + data, err, 'warn');
    }
  };

  window |> _El.on('message', parseMessage);

  const qpmap = _.getQueryParams();
  const platform = qpmap.platform;

  if (platform) {
    _Doc.body |> _El.addClass(platform);

    const platformFn = platformSpecific[platform];

    if (_.isFunction(platformFn)) {
      platformFn();
    }
  }

  if (Bridge.hasCheckoutBridge()) {
    delete Track.props.referer;
    Track.props.platform = 'mobile_sdk';

    var os = qpmap.platform;
    if (os) {
      Track.props.os = os;
    }
  }

  if (qpmap.message) {
    parseMessage({ data: atob(qpmap.message) });
  }

  Razorpay.sendMessage({ event: 'load' });
}
