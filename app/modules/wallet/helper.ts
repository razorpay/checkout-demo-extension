import { getWallets } from 'checkoutstore/methods';
import { ajaxRouteNotSupported } from 'common/useragent';
import { getPreferences, getOption } from 'razorpay';
import { isPowerWallet } from 'common/wallet';
import type { WalletCode } from 'wallet/types';

/*
 * Return true `dynamic_wallet_flow` flag is enabled in preferences and ajax route is supported.
 *
 * @param {object} pref
 * @returns {boolean}
 */
export function isDynamicWalletFlow(): boolean {
  return (
    !ajaxRouteNotSupported && (getPreferences('dynamic_wallet_flow') as boolean)
  );
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

/**
 * For dynamic wallet flow where ajax route is not supported don't show prower wallets
 *
 * @param code wallet code
 * @returns boolean
 */
export function showPowerWallet(code: WalletCode): boolean {
  return !(
    getPreferences('dynamic_wallet_flow') &&
    ajaxRouteNotSupported &&
    isPowerWallet(code)
  );
}
