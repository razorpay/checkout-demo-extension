import fetch from '../utils/fetch';
import * as _ from '../utils/_';
import { makeUrl } from '../common/helper';
import {
  getLitePreferencesFromStorage,
  setLitePreferencesToStorage,
  removeLitePreferencesFromStorage as remove,
} from './service';
import { setParamsForDdosProtection } from '../checkoutframe/utils';
import { BUILD_NUMBER, LIBRARY, PLATFORM } from '../common/constants';
import type { Preferences } from '../razorpay/types/Preferences';
import RazorpayConfig from 'common/RazorpayConfig';

function fetchPrefsFromApi(options: any): Promise<Preferences> {
  setParamsForDdosProtection({});

  const params: any = {
    key_id: options.key_id,
    currency: [options.currency ?? 'INR'],
    '_[preference_source]': 'checkout_frame_lite',
    '_[build]': BUILD_NUMBER,
    '_[library]': LIBRARY,
    '_[platform]': PLATFORM,
  };

  RazorpayConfig.api = '/';

  return new Promise((resolve, reject) => {
    fetch({
      url: _.appendParamsToUrl(makeUrl('preferences'), params),
      callback: function (prefsResponse) {
        if (prefsResponse.status_code && prefsResponse.status_code !== 200) {
          reject(prefsResponse);
        }
        resolve(prefsResponse);
      },
    });
  });
}

/**
 * if a cached version of preferences is available within
 * TTL, reuse it, else fetch and store in localstorage
 */
export function fetchPreferences(prefOptions: { key_id: string }) {
  const existingPrefs = getLitePreferencesFromStorage(prefOptions.key_id);

  /**
   * skip cache when
   * - Cache has become stale
   * also updates the localstorage cache
   */
  if (isStalePreference(existingPrefs)) {
    remove(prefOptions.key_id);

    return fetchPrefsFromApi(prefOptions).then((apiPrefs) => {
      setLitePreferencesToStorage(apiPrefs, prefOptions.key_id);
      return apiPrefs;
    });
  }

  return Promise.resolve(existingPrefs?.preferences);
}

export function removeLitePreferencesFromStorage(key: string) {
  remove(key);
}

function isStalePreference(
  existingPrefs: ReturnType<typeof getLitePreferencesFromStorage>
) {
  if (!existingPrefs?.updatedAt) {
    return true;
  }

  const hourInMs = 60 * 60 * 1000;
  return Date.now() - existingPrefs.updatedAt > hourInMs;
}
