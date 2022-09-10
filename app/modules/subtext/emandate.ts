import { getShortBankName } from 'i18n';
import { generateTextFromList } from 'i18n/text-utils';
import { getEMandateBanks } from 'checkoutstore/methods';

type instrument = {
  banks: Array<string>;
  id: string;
  method: string;
  _type: string;
};

/**
 * Generates subtext for emandate instrument
 * @param {Instrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForEmandateInstrument(
  instrument: instrument,
  locale: string
) {
  if (!instrument.banks) {
    return '';
  }

  const names = instrument.banks.map((bank: string) => {
    let bankName = getShortBankName(bank, locale);
    let emandateBanks: any;
    if (bank === bankName) {
      /**
       * For recurring emandate method banks array of object is organized
       * differently. e.g {HDFC:{auth_type:['netbanking], name: 'HDFC Bank'}}
       */
      emandateBanks = getEMandateBanks();
      bankName = emandateBanks[bank]['name'];
    }

    bankName = bankName.replace(/ Bank$/, '');

    return bankName;
  });

  return generateTextFromList(names, locale, 3);
}
