import { generateTextFromList } from 'lib/utils';
import { getCommonBankName } from 'common/bank';

/**
 * Generates a string from the list after filtering for truthy values
 * @param {Array<string>} list
 *
 * @returns {string}
 */
function concatTruthyString(list) {
  return list |> _Arr.filter(Boolean) |> _Arr.join(' ');
}

/**
 * Creates subtext to be used for a Card Instrument
 * To understand how the strings are supposed to be generated,
 * take a look at the tests, or the document here:
 * https://docs.google.com/spreadsheets/d/1Yqz_4GBT0aSxvYu1xjflQLy2I-PnLq5GZsFY8Pi-3OY/edit?usp=sharing
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
export function generateSubtextForCardInstrument(instrument) {
  const instrumentIssuers =
    instrument.issuers || []
    |> _Arr.map(bank => getCommonBankName(bank).replace(/ Bank$/, ''));
  const instrumentNetworks = instrument.networks || [];
  const instrumentTypes = instrument.types || [];
  const instrumentIins = instrument.iins || [];

  const issuersLength = instrumentIssuers.length;
  const networksLength = instrumentNetworks.length;
  const typesLength = instrumentTypes.length;
  const iinsLength = instrumentIins.length;

  const supportAllIssuers = issuersLength === 0;
  const supportAllNetworks = networksLength === 0;
  const supportAllTypes = typesLength === 0;
  const supportAllIins = iinsLength === 0;

  // If IINs are provided, use only IINs to generate subtext
  if (!supportAllIins) {
    let iinsString;

    if (iinsLength <= 3) {
      iinsString = generateTextFromList(instrumentIins);
    } else {
      iinsString = 'select BINs';
    }

    return concatTruthyString(['Only', iinsString, 'accepted']);
  }

  if (supportAllIssuers) {
    let stringList = ['Only'];

    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (supportAllNetworks) {
      if (supportAllTypes) {
        return 'All cards supported';
      }
    } else if (networksLength <= 2) {
      networksString = generateTextFromList(instrumentNetworks, 2);
    } else {
      if (supportAllTypes) {
        networksString = 'select networks';
        cardsString = null;
      } else {
        networksString = 'select network';
      }
    }

    stringList = _Arr.mergeWith(stringList, [
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 1) {
    let stringList = ['Only'];

    let issuersString = instrumentIssuers[0];
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = `select ${issuersString}`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 2) {
    let stringList = ['Only'];

    let issuersString = generateTextFromList(instrumentIssuers, 2);
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      if (supportAllTypes) {
        networksString = instrumentNetworks[0];
      } else {
        issuersString = `select ${issuersString}`;
      }
    } else {
      issuersString = `select`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else {
    let stringList = ['Only'];

    let issuersString = 'select';
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = `select`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  }
}
