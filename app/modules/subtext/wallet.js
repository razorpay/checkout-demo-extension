import { generateTextFromList } from 'lib/utils';
import { getWallets } from 'checkoutstore/methods';

/**
 * Generates subtext for wallet instrument
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
export function generateSubtextForWalletInstrument(instrument) {
  if (!instrument.wallets) {
    return '';
  }

  const wallets = getWallets();

  const findWallet = code => _Arr.find(wallets, wallet => wallet.code === code);

  const walletNames = _Arr.map(
    instrument.wallets,
    wallet => findWallet(wallet).name
  );

  return generateTextFromList(walletNames, 3);
}
