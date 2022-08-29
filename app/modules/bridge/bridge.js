/**
 * Generic Bridge interface for all the bridges and platforms.
 * Bridge interface is not to be used for legacy iOS SDKs
 * @param {String} bridgeName is taken as input
 **/
export default function Bridge(bridgeName) {
  this.name = bridgeName;
  this._exists = false;
  this.platform = '';
  this.bridge = {};
  this.init();
}

Bridge.prototype = {
  init: function () {
    const bridgeName = this.name;
    /* A little misleading because CheckoutBridge can exist for iOS as well */
    const androidBridge = window[bridgeName];
    const iosBridge = ((window.webkit || {}).messageHandlers || {})[bridgeName];

    if (iosBridge) {
      this._exists = true;
      this.bridge = iosBridge;
      this.platform = 'ios';
    } else if (androidBridge) {
      this._exists = true;
      this.bridge = androidBridge;
      this.platform = 'android';
    }
  },

  exists: function () {
    return this._exists;
  },

  get: function (methodName) {
    if (!this.exists()) {
      return;
    }

    if (this.platform === 'android') {
      if (_.isFunction(this.bridge[methodName])) {
        return this.bridge[methodName];
      }
    } else if (this.platform === 'ios') {
      return this.bridge.postMessage;
    }
  },

  has: function (methodName) {
    if (this.exists() && this.get(methodName)) {
      return true;
    }

    return false;
  },

  /**
   * This is used to call Android's bridges.
   *
   * Note: it won't be able to invoke CheckoutBridge for iOS because the
   * CheckoutBridge is instantiated on iOS after the bridge `init` is called.
   * So, according to the Bridge it does not exist for iOS, call it manually
   * for iOS similar to notifyBridge method.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
  callAndroid: function (methodName, ...params) {
    params = params.map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    );

    const method = this.get(methodName);

    if (method) {
      return method.apply(this.bridge, params);
    }
  },

  /**
   * This is used to call iOS's bridges.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
  callIos: function (methodName, ...params) {
    const method = this.get(methodName);

    if (method) {
      try {
        let dataObject = { action: methodName };

        let parameters = params[0];
        if (parameters) {
          dataObject.body = parameters;
        }

        return method.call(this.bridge, dataObject);
      } catch (e) {}
    }
  },

  /**
   * Generic method that calls the appropriate bridge for the current platform.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
  call: function (methodName, ...params) {
    const method = this.get(methodName);
    params = [methodName].concat(params);

    if (method) {
      this.callAndroid.apply(this, params);
      this.callIos.apply(this, params);
    }
  },
};
