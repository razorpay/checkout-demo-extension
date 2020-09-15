import { generateTextFromList } from 'i18n/text-utils';
import { getWallets } from 'checkoutstore/methods';
import { getWalletName } from 'i18n';

/**
 * Generates subtext for wallet instrument
 * @param {Instrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForWalletInstrument(instrument, locale) {
  if (!instrument.wallets) {
    return '';
  }

  const wallets = getWallets();

  const findWallet = code => _Arr.find(wallets, wallet => wallet.code === code);

  const walletNames = _Arr.map(instrument.wallets, wallet =>
    getWalletName(findWallet(wallet).code, locale)
  );

  return generateTextFromList(walletNames, locale, 3);
}
