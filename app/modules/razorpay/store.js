/**
 * Don't Import any other module files here
 * If import requires make sure that file doesn't import any other module [to prevent circular dependencies]
 */
import { writable } from 'svelte/store';
import { IRCTC_KEYS } from './constant';
import { get } from 'utils/object';

class RazorpayStore {
  instance = null;
  preferenceResponse = null;

  constructor() {
    this._store = writable();
  }

  updateInstance = (instance) => {
    this.razorpayInstance = instance;
  };

  set razorpayInstance(instance) {
    this.instance = instance;
    this.preferenceResponse = instance.preferences;
    this._store.set(instance);
    if (this.isIRCTC()) {
      this.set('theme.image_frame', false);
    }
  }

  get razorpayInstance() {
    return this.instance;
  }

  get preferences() {
    return this.preferenceResponse;
  }

  triggerInstanceMethod = (method, args = []) => {
    if (this.instance) return this.instance[method].apply(this.instance, args);
  };

  /**
   *
   * @param  {...any} args set options to razorpay instance
   * @returns
   */
  set = (...args) => {
    return this.triggerInstanceMethod('set', args);
  };

  subscribe = (...args) => {
    return this._store.subscribe.apply(this, args);
  };

  /**
   *
   * @param  {...any} args get options from razorpay instance if arg provided else returns razorpay instance
   * @returns
   */
  get = (...args) => {
    if (args.length) return this.triggerInstanceMethod('get', args);
    return this.instance;
  };

  getMerchantOption = (path = '') => {
    const options = this.triggerInstanceMethod('get') || {};
    if (!path) return options;
    return get(options, path);
  };

  /**
   * TODO confirm if this is consumed or not (as IRCTC is using embedded checkout)
   * @returns {boolean} if given merchant key is IRCTC merchant or not
   */
  isIRCTC = () => {
    return IRCTC_KEYS.indexOf(this.get('key')) >= 0;
  };

  getCardFeatures = (iin) => {
    return this.instance.getCardFeatures(iin);
  };
}

const Store = new RazorpayStore();

export default Store;
