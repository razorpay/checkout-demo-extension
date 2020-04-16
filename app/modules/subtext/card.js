import { generateTextFromList } from 'lib/utils';
import { getCommonBankName } from 'common/bank';
import { networks as CardNetworks } from 'common/card';

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
export function generateCardSubtext(instrument) {
  const instrumentIssuers =
    instrument.issuers || []
    |> _Arr.map(bank => getCommonBankName(bank).replace(/ Bank$/, ''));
  const instrumentNetworks =
    instrument.networks || [] |> _Arr.map(network => CardNetworks[network]);
  const instrumentTypes = instrument.types || [];

  const issuersLength = instrumentIssuers.length;
  const networksLength = instrumentNetworks.length;
  const typesLength = instrumentTypes.length;

  const allIssusers = issuersLength === 0;
  const allNetworks = networksLength === 0;
  const allTypes = typesLength === 0;

  if (allIssusers) {
    let stringList = ['Only'];

    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      if (allTypes) {
        return 'All cards supported';
      }
    } else if (networksLength <= 2) {
      networksString = generateTextFromList(instrumentNetworks, 2);
    } else {
      if (allTypes) {
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

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
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

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      if (allTypes) {
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

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
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
