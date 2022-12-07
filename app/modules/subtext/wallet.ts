import { generateTextFromList } from 'i18n/text-utils';
import { getWallets } from 'checkoutstore/methods';
import { getWalletName } from 'i18n';
import type { WalletInstrument } from './type';

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

  const findWallet = (code: string) =>
    wallets.find((wallet) => wallet.code === code);

  const walletNames = instrument.wallets.map((wallet) =>
    getWalletName(findWallet(wallet).code as string, locale)
  );

  return generateTextFromList(walletNames, locale, 3);
}
