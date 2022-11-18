import Track from 'analytics/tracker';
import browserstorage from 'browserstorage';
import { BUILD_NUMBER } from 'common/constants';
import Razorpay from 'common/Razorpay';
import { getAgentPayload } from 'common/useragentPayload';
import type { Preferences } from 'razorpay/types/Preferences';
import {
  markRelevantPreferencesPayload,
  setParamsForDdosProtection,
} from 'checkoutframe/utils';

export let PREFERENCES_LITE: Preferences;
export let PREFERENCES_LITE_PROMISE: Promise<any> | null;

const TTL = 60 * 60 * 1000; // TTL set to 1h

export function fetchPreferencesLite({
  key_id,
  flush_cache = false,
  currency = 'INR',
}: {
  key_id: string;
  flush_cache: boolean;
  currency: string;
}) {
  PREFERENCES_LITE_PROMISE = new Promise((resolve, reject) => {
    const cachedValue = getCachedValue(key_id, flush_cache);
    if (cachedValue) {
      return resolve(cachedValue);
    }

    setParamsForDdosProtection({});

    const params: any = {
      key_id,
      currency: [currency],
      '_[build]': BUILD_NUMBER,
      '_[library]': Track.props.library,
      '_[platform]': Track.props.platform,
      ...getAgentPayload(),
    };

    if (!navigator.cookieEnabled) {
      params.checkcookie = 0;
    } else {
      /* set test cookie
       * if it is not reflected at backend while fetching prefs, disable
       * cardsaving */
      params.checkcookie = 1;
      document.cookie = 'checkcookie=1;path=/';
    }
    markRelevantPreferencesPayload(params);

    Razorpay.payment.getPrefs(params, (data: any) => {
      if (data.error) {
        reject(data.error);
      }

      PREFERENCES_LITE = data;
      setCache(key_id, data);
      resolve(data);
    });
  });
  return PREFERENCES_LITE_PROMISE;
}

export function getCachedValue(
  key_id: string,
  flush_cache = false
): Preferences | null {
  if (flush_cache) {
    return null;
  }

  const updated_at =
    parseInt(
      String(browserstorage.getItem(`preferences_lite_updated_at[${key_id}]`))
    ) || 0;
  if (Date.now() - updated_at > TTL) {
    return null;
  }

  const preferences_lite = browserstorage.getItem(
    `preferences_lite[${key_id}]`
  );
  if (preferences_lite) {
    return JSON.parse(String(preferences_lite)) as Preferences;
  }

  return null;
}

export function setCache(key_id: string, response: Preferences) {
  browserstorage.setItem(
    `preferences_lite_updated_at[${key_id}]`,
    Date.now().toString()
  );
  browserstorage.setItem(
    `preferences_lite[${key_id}]`,
    JSON.stringify(response)
  );
}
