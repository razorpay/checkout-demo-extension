import { getWallets } from 'checkoutstore/methods';
import { hasFeature, getPreferences, getOption } from 'razorpay';

/*
 * Return true if `raas` feature flag and `dynamic_wallet_flow` flag is enabled in preferences.
 *
 * @param {object} pref
 * @returns {boolean}
 */
export function isDynamicWalletFlow(): boolean {
  return hasFeature('raas') || getPreferences('dynamic_wallet_flow');
}

// check and return prefill wallet
export function validateAndFetchPrefilledWallet(): string {
  try {
    let prefilledWallet = getOption('prefill.wallet');
    const walletsEnabledForMerchant = getWallets() || [];

    if (prefilledWallet && walletsEnabledForMerchant.length > 0) {
      /* check if prefill wallet passed in options is correct and enabled for merchant */
      const validWallet = walletsEnabledForMerchant.find(
        (wallet) => wallet.code === prefilledWallet
      );
      prefilledWallet = (validWallet && validWallet.code) || '';
    } else {
      prefilledWallet = '';
    }
    return prefilledWallet;
  } catch {
    return '';
  }
}
