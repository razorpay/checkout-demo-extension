import { generateTextFromList } from 'i18n/text-utils';
import { getBanks } from 'razorpay';
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

  const names = instrument.banks.map((bank) => {
    let bankName = getShortBankName(bank, locale);

    if (bank === bankName) {
      bankName = getBanks()[bank];
    }

    bankName = bankName.replace(/ Bank$/, '');

    return bankName;
  });

  return generateTextFromList(names, locale, 3);
}
