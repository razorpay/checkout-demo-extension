/* global confirm */

import { Track } from 'analytics';
import Bridge from './bridge';
import { documentElement } from 'utils/doc';

/* Our primary bridge is CheckoutBridge */
export const defineIosBridge = () => {
  let CB = {
    /* unique id for ios to retieve resources */
    index: 0,
    map: {},
    get: function () {
      var val = this.map[this.index];
      delete this.map[this.index];
      return val;
    },
    getUID: function () {
      return Track.id;
    },
  };

  return (window.CheckoutBridge = CB);
};

export const getNewIosBridge = () =>
  ((window.webkit || {}).messageHandlers || {}).CheckoutBridge;

export const hasNewIosBridge = () => Boolean(getNewIosBridge());

export const getCheckoutBridge = () => window.CheckoutBridge;

export const hasCheckoutBridge = () => Boolean(getCheckoutBridge());

export const iosLegacyMethod = (method) => {
  let CheckoutBridge = getCheckoutBridge();
  let doc = documentElement;

  return function (data) {
    /* setting up js → ios communication by loading custom protocol inside
     * hidden iframe */
    var iF = _El.create('iframe');
    var src = 'razorpay://on' + method;
    if (data) {
      src += '?' + CheckoutBridge.index;
      CheckoutBridge.map[++CheckoutBridge.index] = data;
    }
    iF.setAttribute('src', src);

    doc.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  };
};

export const checkout = new Bridge('CheckoutBridge');
export const storage = new Bridge('StorageBridge');

/**
 * This method is used to notify events to the SDK bridges
 * This function is only called if CheckoutBridge exists
 * @param  {object} message to be sent to bridge
 */
export const notifyBridge = (message) => {
  /*
   * Use CheckoutBridge here and not instance of Bridge.
   * checkout instance of Bridge is instantiated at the time of first execution
   * of code. At that time only native CheckoutBridge exists (for Android).
   *
   * The mock CheckoutBridge that we create for iOS does not exist at the time
   * of first execution.
   *
   * We want to keep mock CheckoutBridge for iOS separate from checkout
   * instance of the Bridge. This is due to legacy reasons.
   */
  let CheckoutBridge = getCheckoutBridge();

  if (!CheckoutBridge) {
    return;
  }

  if (message && message.event) {
    let bridgeMethod = `on${message.event}`;
    var method = CheckoutBridge[bridgeMethod];

    if (!_.isFunction(method)) {
      return;
    }

    let data = message.data;
    if (!_.isString(data)) {
      if (!data) {
        if (method) {
          return method.call(CheckoutBridge);
        }
      }
      data = _Obj.stringify(data);
    }

    method.call(CheckoutBridge, data);
  }
};
