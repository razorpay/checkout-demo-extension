import { generateTextFromList } from 'i18n/text-utils';
import { getBanks } from 'checkoutstore';
import { getShortBankName } from 'i18n';

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

  const names = _Arr.map(instrument.banks, (bank) => {
    let bankName = getShortBankName(bank, locale);

    if (bank === bankName) {
      bankName = getBanks()[bank];
    }

    bankName = bankName.replace(/ Bank$/, '');

    return bankName;
  });

  return generateTextFromList(names, locale, 3);
}
