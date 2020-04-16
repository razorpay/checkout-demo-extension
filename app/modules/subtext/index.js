import { generateTextFromList } from 'lib/utils';
import { getCommonBankName } from 'common/bank';
import { getBanks } from 'checkoutstore';
import { getWallets } from 'checkoutstore/methods';

import { generateCardSubtext } from './card';

/**
 * Generates subtext for netbanking instrument
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
function generateNetbankingSubtext(instrument) {
  if (!instrument.banks) {
    return '';
  }

  const names = _Arr.map(instrument.banks, bank => {
    let bankName = getCommonBankName(bank);

    if (bank === bankName) {
      bankName = getBanks()[bank];
    }

    bankName = bankName.replace(/ Bank$/, '');

    return bankName;
  });

  return generateTextFromList(names, 3);
}

/**
 * Generates subtext for wallet instrument
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
function generateWalletSubtext(instrument) {
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

const INSTRuMENT_SUBTEXT = {
  card: generateCardSubtext,
  netbanking: generateNetbankingSubtext,
  wallet: generateWalletSubtext,
};

/**
 * Generates subtext for an instrument
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
export function getSubtextForInstrument(instrument) {
  if (INSTRuMENT_SUBTEXT[instrument.method]) {
    return INSTRuMENT_SUBTEXT[instrument.method](instrument);
  }
}
