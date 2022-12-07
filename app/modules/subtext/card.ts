import { generateTextFromList } from 'i18n/text-utils';
import { getCommonBankName } from 'common/bank';

import {
  formatTemplateWithLocale,
  formatMessageWithLocale,
  formatCountriesMessage,
} from 'i18n';
import type { CardInstrument } from './type';
import type { LOCALES } from 'i18n/init';

/**
 * Generates a string from the list after filtering for truthy values
 * @param {Array<string>} list
 *
 * @returns {string}
 */
function concatTruthyString(list: string[]) {
  return list.filter(Boolean).join(' ');
}

type commonBankParam = Parameters<typeof getCommonBankName>[0];

/**
 * Creates subtext to be used for a Card Instrument
 * To understand how the strings are supposed to be generated,
 * take a look at the tests, or the document here:
 * https://docs.google.com/spreadsheets/d/1Yqz_4GBT0aSxvYu1xjflQLy2I-PnLq5GZsFY8Pi-3OY/edit?usp=sharing
 * @param {CardInstrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForCardInstrument(
  instrument: CardInstrument,
  locale: keyof typeof LOCALES
) {
  const instrumentIssuers = (instrument.issuers || []).map((bank) =>
    getCommonBankName(bank as unknown as commonBankParam).replace(/ Bank$/, '')
  );
  const instrumentNetworks = instrument.networks || [];
  const instrumentTypes = instrument.types || [];
  const instrumentIins = instrument.iins || [];
  const instrumentCountries = instrument.countries || [];

  const issuersLength = instrumentIssuers.length;
  const networksLength = instrumentNetworks.length;
  const typesLength = instrumentTypes.length;
  const iinsLength = instrumentIins.length;
  const countriesLength = instrumentCountries.length;

  const supportAllIssuers = issuersLength === 0;
  const supportAllNetworks = networksLength === 0;
  const supportAllTypes = typesLength === 0;
  const supportAllIins = iinsLength === 0;
  const supportAllCountries = countriesLength === 0;
  // If IINs are provided, use only IINs to generate subtext
  if (!supportAllIins) {
    if (iinsLength <= 3) {
      return formatTemplateWithLocale(
        'card_subtext.specific_bins_supported',
        { bins: generateTextFromList(instrumentIins, locale) },
        locale
      );
    }
    return formatMessageWithLocale(
      'card_subtext.select_bins_supported',
      locale
    );
  }

  if (supportAllIssuers) {
    let stringList: unknown[] = [
      formatMessageWithLocale('card_subtext.only', locale),
    ];

    let typesString;
    let cardsString: string | null = 'cards';
    let networksString;
    let countriesString;
    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
    }
    if (!supportAllCountries) {
      countriesString = formatCountriesMessage(instrumentCountries);
    }
    if (supportAllNetworks) {
      if (supportAllTypes) {
        if (supportAllCountries) {
          return formatMessageWithLocale(
            'card_subtext.all_cards_supported',
            locale
          );
        }
      }
    } else if (networksLength <= 2) {
      networksString = generateTextFromList(instrumentNetworks, locale, 2);
    } else {
      if (supportAllTypes) {
        networksString = formatMessageWithLocale(
          'card_subtext.select_networks',
          locale
        );
        cardsString = null;
      } else {
        networksString = formatMessageWithLocale(
          'card_subtext.select_network',
          locale
        );
      }
    }

    stringList = stringList.concat([
      networksString,
      typesString,
      countriesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList as string[]);
  } else if (issuersLength === 1) {
    let stringList: unknown[] = [
      formatMessageWithLocale('card_subtext.only', locale),
    ];

    let issuersString = instrumentIssuers[0];
    let typesString;
    const cardsString = formatMessageWithLocale('card_subtext.cards', locale);
    let networksString;
    let countriesString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
    }
    if (!supportAllCountries) {
      countriesString = formatCountriesMessage(instrumentCountries);
    }

    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = formatTemplateWithLocale(
        'card_subtext.select_networks_specific_issuers',
        { issuers: issuersString },
        locale
      );
    }

    stringList = stringList.concat([
      issuersString,
      networksString,
      typesString,
      countriesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList as string[]);
  } else if (issuersLength === 2) {
    let stringList: unknown[] = [
      formatMessageWithLocale('card_subtext.only', locale),
    ];

    let issuersString = generateTextFromList(instrumentIssuers, locale, 2);
    let typesString;
    const cardsString = formatMessageWithLocale('card_subtext.cards', locale);
    let networksString;
    let countriesString;
    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
    }
    if (!supportAllCountries) {
      countriesString = formatCountriesMessage(instrumentCountries);
    }
    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      if (supportAllTypes) {
        networksString = instrumentNetworks[0];
      } else {
        issuersString = formatTemplateWithLocale(
          'card_subtext.select_networks_specific_issuers',
          { issuers: issuersString },
          locale
        );
      }
    } else {
      issuersString = formatMessageWithLocale('card_subtext.select', locale);
    }

    stringList = stringList.concat([
      issuersString,
      networksString,
      typesString,
      countriesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList as string[]);
  }
  let stringList: unknown[] = [
    formatMessageWithLocale('card_subtext.only', locale),
  ];

  let issuersString = formatMessageWithLocale('card_subtext.select', locale);
  let typesString;
  const cardsString = formatMessageWithLocale('card_subtext.cards', locale);
  let networksString;
  let countriesString;

  if (!supportAllTypes) {
    typesString = generateTextFromList(instrumentTypes, locale);
  }
  if (!supportAllCountries) {
    countriesString = formatCountriesMessage(instrumentCountries);
  }
  if (supportAllNetworks) {
    // Do nothing
  } else if (networksLength === 1) {
    networksString = instrumentNetworks[0];
  } else {
    issuersString = formatMessageWithLocale('card_subtext.select', locale);
  }

  stringList = stringList.concat([
    issuersString,
    networksString,
    typesString,
    countriesString,
    cardsString,
    formatMessageWithLocale('card_subtext.supported', locale),
  ]);

  return concatTruthyString(stringList as string[]);
}
