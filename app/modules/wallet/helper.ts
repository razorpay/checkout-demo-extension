import { hasFeature, getPreferences } from 'razorpay';

/*
 * Return true if `raas` feature flag and `dynamic_wallet_flow` flag is enabled in preferences.
 *
 * @param {object} pref
 * @returns {boolean}
 */
export function isDynamicWalletFlow(): boolean {
  return hasFeature('raas') || getPreferences('dynamic_wallet_flow');
}
