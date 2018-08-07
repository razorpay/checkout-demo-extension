import { getQueryParams, handleMessage } from 'checkoutframe/index';
import * as Bridge from 'bridge';
import { ownerWindow } from 'common/constants';

/* Move this to Bridge */

function getNewIOSWebkitInstance() {
  //Verify inner CheckoutBridge property for new iOS devices
  return ((window.webkit || {}).messageHandlers || {}).CheckoutBridge;
}

function dispatchNewIOSEvents(method, data) {
  iosCheckoutBridgeNew.postMessage({
    action: method,
    body: data,
  });
}

//handle methods for new IOS app
function handleNewIOSMethods(method, data) {
  var color = {
    theme: hexToRgb(preferences.options.theme.color) || null,
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
      dispatchNewIOSEvents('hide_nav_bar', navData);
      //add theme color
      data.theme_color = color.theme;
      dispatchNewIOSEvents(method, data); //default load
      break;
    case 'submit':
      dispatchNewIOSEvents(method, data); //send default submit
      navData = {
        webview_background_color: color.navShow,
      };
      dispatchNewIOSEvents('show_nav_bar', navData);
      break;
    default:
      dispatchNewIOSEvents(method, data);
  }
}

const iosCheckoutBridgeNew = getNewIOSWebkitInstance();

// generates ios event handling functions, like onload
function iosMethod(method) {
  return function(data) {
    if (iosCheckoutBridgeNew) {
      handleNewIOSMethods(method, data);
    } else {
      var iF = document.createElement('iframe');
      var src = 'razorpay://on' + method;
      if (data) {
        src += '?' + CheckoutBridge.index;
        CheckoutBridge.map[++CheckoutBridge.index] = data;
      }
      iF.setAttribute('src', src);
      doc.appendChild(iF);
      iF.parentNode.removeChild(iF);
      iF = null;
    }
  };
}

const platformSpecific = {
  ios: () => {
    // setting up js -> ios communication by loading custom protocol inside hidden iframe
    let CheckoutBridge = (window.CheckoutBridge = {
      // unique id for ios to retieve resources
      index: 0,
      map: {},
      get: function(index) {
        var val = this.map[this.index];
        delete this.map[this.index];
        return val;
      },
      getUID: function() {
        return _uid;
      },
    });
    var bridgeMethods = ['load', 'dismiss', 'submit', 'fault', 'success'];
    each(bridgeMethods, function(i, prop) {
      CheckoutBridge['on' + prop] = iosMethod(prop);
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
      window.handleMessage(data);
    } catch (err) {
      // roll('message: ' + data, err, 'warn');
    }
  };

  window |> _El.on('message', parseMessage);

  const qpmap = getQueryParams();
  const platform = qpmap.platform;

  if (platform) {
    _Doc.body |> _El.addClass(platform);

    const platformFn = platformSpecific[platform];

    if (_.isFunction(platformFn)) {
      platformFn();
    }
  }

  /* TODO: add platform specific exists */
  if (Bridge.checkout.exists() && Bridge.checkout.platform === 'android') {
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
