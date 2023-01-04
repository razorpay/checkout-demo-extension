import { generateTextFromList } from 'i18n/text-utils';
import { getWallets } from 'checkoutstore/methods';
import { getWalletName } from 'i18n';
import type { WalletInstrument } from './type';
import type { Wallet, WalletCode } from 'wallet/types';

/**
 * Generates subtext for wallet instrument
 * @param {WalletInstrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForWalletInstrument(
  instrument: WalletInstrument,
  locale: string
) {
  if (!instrument.wallets) {
    return '';
  }

  const wallets = getWallets();

  const findWallet = (code: WalletCode) =>
    wallets.find((wallet) => wallet.code === code) as Wallet;

  const walletNames = instrument.wallets.map((wallet) =>
    getWalletName(findWallet(wallet as WalletCode).code, locale)
  );

  return generateTextFromList(walletNames, locale, 3);
}
