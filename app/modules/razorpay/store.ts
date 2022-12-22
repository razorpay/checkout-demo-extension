/**
 * Don't Import any other module files here
 * If import requires make sure that file doesn't import any other module [to prevent circular dependencies]
 */
import { IRCTC_KEYS } from './constant';
import { get } from 'utils/object';
import type { PreferencesObject } from './types/Preferences';
import type { Option, OptionObject } from './types/Options';

class RazorpayStore {
  instance: any = null;
  preferenceResponse: PreferencesObject = {} as PreferencesObject;
  isEmbedded = false; // when parent is provided

  subscription: Array<(instance: any) => void> = [];

  constructor() {
    this.subscription = [];
  }

  updateInstance = (instance: any) => {
    this.razorpayInstance = instance;
  };

  set razorpayInstance(instance) {
    this.instance = instance;
    this.preferenceResponse = instance.preferences as PreferencesObject;
    // trigger subscriptions
    this.subscription.forEach((fx) => {
      if (typeof fx === 'function') {
        fx(instance);
      }
    });
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

  triggerInstanceMethod = (method: string, args: any = []) => {
    if (this.instance) {
      return (this.instance[method] as () => any).apply(this.instance, args);
    }
  };

  /**
   *
   * @param  {...any} args set options to razorpay instance
   * @returns
   */
  set = (...args: any) => {
    return this.triggerInstanceMethod('set', args);
  };

  subscribe = (fx: (instance: any) => void) => {
    this.subscription.push(fx);
  };

  /**
   *
   * @param  {...any} args get options from razorpay instance if arg provided else returns razorpay instance
   * @returns
   */
  get = (...args: any) => {
    if (args.length) {
      return this.triggerInstanceMethod('get', args);
    }
    return this.instance;
  };

  public getMerchantOption = (path = ''): any => {
    const options = this.triggerInstanceMethod('get') || {};
    if (!path) {
      return options;
    }
    return options[path];
  };

  /**
   * TODO confirm if this is consumed or not (as IRCTC is using embedded checkout)
   * @returns {boolean} if given merchant key is IRCTC merchant or not
   */
  isIRCTC = () => {
    return IRCTC_KEYS.indexOf(this.get('key')) >= 0;
  };

  getCardFeatures = (iin: string) => {
    return this.instance.getCardFeatures(iin);
  };
}

const Store = new RazorpayStore();

export default Store;
