import { generateTextFromList } from 'i18n/text-utils';
import { getCommonBankName } from 'common/bank';

import { formatTemplateWithLocale, formatMessageWithLocale } from 'i18n';
import {
  CARD_OFFER_CREDIT_DEBIT_CALLOUT,
  CARD_OFFER_CREDIT_ONLY_CALLOUT,
  CARD_OFFER_DEBIT_ONLY_CALLOUT,
  RECURRING_CREDIT_DEBIT_CALLOUT,
  RECURRING_CREDIT_ONLY_CALLOUT,
  RECURRING_DEBIT_ONLY_CALLOUT,
  SUBSCRIPTIONS_CREDIT_DEBIT_CALLOUT,
  SUBSCRIPTIONS_CREDIT_ONLY_CALLOUT,
  SUBSCRIPTIONS_DEBIT_ONLY_CALLOUT,
} from 'ui/labels/home';

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
 * @param {string} locale
 *
 * @returns {string}
 */
export function generateSubtextForCardInstrument(instrument, locale) {
  const instrumentIssuers =
    instrument.issuers || []
    |> _Arr.map((bank) => getCommonBankName(bank).replace(/ Bank$/, ''));
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
    let stringList = [formatMessageWithLocale('card_subtext.only', locale)];

    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
    }

    if (supportAllNetworks) {
      if (supportAllTypes) {
        return formatMessageWithLocale(
          'card_subtext.all_cards_supported',
          locale
        );
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

    stringList = _Arr.mergeWith(stringList, [
      networksString,
      typesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 1) {
    let stringList = [formatMessageWithLocale('card_subtext.only', locale)];

    let issuersString = instrumentIssuers[0];
    let typesString;
    let cardsString = formatMessageWithLocale('card_subtext.cards', locale);
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
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

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 2) {
    let stringList = [formatMessageWithLocale('card_subtext.only', locale)];

    let issuersString = generateTextFromList(instrumentIssuers, locale, 2);
    let typesString;
    let cardsString = formatMessageWithLocale('card_subtext.cards', locale);
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
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

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList);
  } else {
    let stringList = [formatMessageWithLocale('card_subtext.only', locale)];

    let issuersString = formatMessageWithLocale('card_subtext.select', locale);
    let typesString;
    let cardsString = formatMessageWithLocale('card_subtext.cards', locale);
    let networksString;

    if (!supportAllTypes) {
      typesString = generateTextFromList(instrumentTypes, locale);
    }

    if (supportAllNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = formatMessageWithLocale('card_subtext.select', locale);
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      formatMessageWithLocale('card_subtext.supported', locale),
    ]);

    return concatTruthyString(stringList);
  }
}

export function generateSubtextForRecurring({
  types = {},
  networks = {},
  issuers = {},
  subscription,
  offer,
  locale,
}) {
  const { debit, credit } = types;
  const { mastercard, visa, amex } = networks;

  const debitCardIssuers = generateTextFromList(_Obj.values(issuers), locale);
  const creditCardsNetworks = generateTextForCardNetwork(
    {
      mastercard,
      visa,
      amex,
    },
    locale
  );

  if (subscription) {
    if (credit && debit) {
      // Subscription payments are supported on Mastercard, Visa, and American Express credit cards and debit cards from ICICI, Kotak, Citibank, and Canara Bank.
      return formatTemplateWithLocale(
        SUBSCRIPTIONS_CREDIT_DEBIT_CALLOUT,
        {
          creditIssuers: creditCardsNetworks,
          debitIssuers: debitCardIssuers,
        },
        locale
      );
    } else if (debit) {
      // Subscription payments are supported on debit cards from ICICI, Kotak, Citibank, and Canara Bank.
      return formatTemplateWithLocale(
        SUBSCRIPTIONS_DEBIT_ONLY_CALLOUT,
        {
          issuers: debitCardIssuers,
        },
        locale
      );
    } else {
      // Subscription payments are supported on Mastercard, Visa, and American Express credit cards.
      return formatTemplateWithLocale(
        SUBSCRIPTIONS_CREDIT_ONLY_CALLOUT,
        {
          issuers: creditCardsNetworks,
        },
        locale
      );
    }
  } else if (offer) {
    // All issuer cards are supported for this payment.
    // All issuer credit cards are supported for this payment.
    // All issuer debit cards are supported for this payment.

    if (credit && debit) {
      return formatTemplateWithLocale(
        CARD_OFFER_CREDIT_DEBIT_CALLOUT,
        { issuer: offer.issuer },
        locale
      );
    } else if (debit) {
      return formatTemplateWithLocale(
        CARD_OFFER_DEBIT_ONLY_CALLOUT,
        { issuer: offer.issuer },
        locale
      );
    } else {
      return formatTemplateWithLocale(
        CARD_OFFER_CREDIT_ONLY_CALLOUT,
        { issuer: offer.issuer },
        locale
      );
    }
  } else {
    if (credit && debit) {
      // Mastercard, Visa, and American Express credit cards and debit cards from ICICI, Kotak, Citibank, and Canara Bank are supported for this payment.
      return formatTemplateWithLocale(
        RECURRING_CREDIT_DEBIT_CALLOUT,
        {
          creditIssuers: creditCardsNetworks,
          debitIssuers: debitCardIssuers,
        },
        locale
      );
    } else if (debit) {
      // Only debit cards from ICICI, Kotak, Citibank, and Canara Bank are supported for this payment.
      return formatTemplateWithLocale(
        RECURRING_DEBIT_ONLY_CALLOUT,
        {
          issuers: debitCardIssuers,
        },
        locale
      );
    } else {
      // Only Mastercard, Visa, and American Express credit cards are supported for this payment.
      return formatTemplateWithLocale(
        RECURRING_CREDIT_ONLY_CALLOUT,
        {
          issuers: creditCardsNetworks,
        },
        locale
      );
    }
  }
}

function generateTextForCardNetwork({ mastercard, visa, amex }, locale) {
  const networksList =
    [
      visa ? 'Visa' : '',
      mastercard ? 'Mastercard' : '',
      amex ? 'American Express' : '',
    ] |> _Arr.filter(Boolean);
  return generateTextFromList(networksList, locale);
}
