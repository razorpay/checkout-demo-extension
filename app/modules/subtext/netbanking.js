import { generateTextFromList } from 'lib/utils';
import { getCommonBankName } from 'common/bank';
import { getBanks } from 'checkoutstore';

/**
 * Generates subtext for netbanking instrument
 * @param {Instrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForNetbankingInstrument(instrument, locale) {
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

  return generateTextFromList(names, locale, 3);
}
