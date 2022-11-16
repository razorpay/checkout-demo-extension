// stores
import { get } from 'svelte/store';
import { customer } from 'checkoutstore/customer';

// utils
import { getIin } from 'common/card';
import { CardViews, MethodIdentifiers, TOP_CURRENCIES } from './constants';
import { getDCCPayloadData } from './store';

export class DCCError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DCC';
    this.message = `DCC Error: ${message}`;
  }
}

export const getCardByTokenId = (
  tokenId: DCC.Props['id']
): DCC.Instrument | undefined => {
  return ((get(customer) as DCC.Props['customer'])?.tokens?.items ?? []).find(
    (token: DCC.Instrument) => token?.id === tokenId
  );
};

/**
 * Helper function to check if DCC is allowed on particular identifier.
 *
 * @param {string} identifier Payment method identifier
 * @returns {boolean} allowed or not
 */
export const isDCCAllowedOnIdentifier = (
  identifier: DCC.Props['identifier']
) => {
  return ['iin', 'tokenId', 'provider', 'walletCode'].includes(identifier);
};

/**
 * Helper function to sort DCC currencies
 *
 * Sort currencies with the following priority:
 * 1.) Default Currency
 * 2.) Top currencies
 * 3.) Entity Currency
 * 4.) Rest
 *
 * @param {Object} sortCurrencyInput
 * @param {string} sortCurrencyInput.defaultCurrency
 * @param {DCC.CurrenciesMapType} sortCurrencyInput.allCurrency
 * @param {DCC.Currency} sortCurrencyInput.currency
 * @returns {{ defaultCurrency: string, amount: number, currencies: DCC.CurrencyListType }}
 */
export const sortDCCCurrencies = ({
  defaultCurrency,
  allCurrencies,
  currency,
}: {
  defaultCurrency?: DCC.Currency;
  currency: DCC.Currency;
  allCurrencies: DCC.CurrenciesMapType;
}): {
  defaultCurrency: DCC.Currency;
  currencies: DCC.CurrencyListType;
  amount: DCC.Props['amount'];
} => {
  const allCurrenciesEntries = Object.entries(allCurrencies);

  let defaultCurrencyAmount: DCC.Props['amount'] = 0;

  if (!defaultCurrency && !allCurrenciesEntries.length) {
    return {
      defaultCurrency: '',
      currencies: [],
      amount: defaultCurrencyAmount,
    };
  }

  /**
   * if default currency is not set, the pick the first currency from allCurrencies list
   */
  if (!defaultCurrency && allCurrenciesEntries.length) {
    defaultCurrency = allCurrenciesEntries[0][0];
  }

  /**
   * if defaultCurrency does not exists in allCurrencies list then also pick the first currency from allCurrencies list
   */
  if (
    allCurrenciesEntries.length &&
    !allCurrenciesEntries.some(([currency]) => currency === defaultCurrency)
  ) {
    defaultCurrency = allCurrenciesEntries[0][0];
  }

  const topCurrencies = [defaultCurrency, currency];
  /**
   * if defaultCurrency === currency then Insert entity currency on 2nd position.
   */
  let i = 0;
  while (topCurrencies[0] === topCurrencies[1]) {
    topCurrencies[1] = TOP_CURRENCIES[i];
    i++;
  }

  const sorted = allCurrenciesEntries.sort((_a, _b) => {
    const a = _a[0];
    const b = _b[0];
    if (a === defaultCurrency) {
      return -1;
    }
    if (b === defaultCurrency) {
      return 1;
    }
    if (topCurrencies.includes(a)) {
      return -1;
    }
    if (topCurrencies.includes(b)) {
      return 1;
    }
    return 0;
  });

  const defaultCurrencyInSorted = sorted.find(
    ([currency]) => currency === defaultCurrency
  );

  if (defaultCurrencyInSorted) {
    defaultCurrencyAmount = defaultCurrencyInSorted[1]?.amount;
  }

  return {
    defaultCurrency: defaultCurrency || '',
    amount: defaultCurrencyAmount,
    currencies: sorted.map(([currency, rest]) => ({
      ...rest,
      _key: currency,
      currency,
    })),
  };
};

/**
 * Public helper function to get DCC entity from instrument
 *
 * @public
 *
 * @example
 * // 1. Card number
 * $cardNumber = '4242424242424242';
 *
 * const dccEntity = getEntityFromInstrument({ instrument: $cardNumber, identifier: 'iin' });
 * console.log(dccEntity) // { entity: '424242', identifier: 'iin', dccEnabled: true }
 *
 * @example
 * // 2. Selected instrument from home screen
 * $selectedInstrument = { token_id: 'token_2jf' };
 *
 * const dccEntity = getEntityFromInstrument({ instrument: $selectedInstrument, identifier: 'tokenId' });
 * console.log(dccEntity) // { entity: 'token_2jf', identifier: 'tokenId', dccEnabled: true };
 *
 * @example
 * // 3. Paypal wallet
 * const dccEntity = getEntityFromInstrument({ instrument: 'paypal', identifier: 'walletCode' });
 * console.log(dccEntity) // { entity: 'paypal', identifier: 'walletCode', dccEnabled: true };
 *
 * @example
 * // 4. Instant Bank transfer provider
 * const dccEntity = getEntityFromInstrument({ instrument: 'trustly', identifier: 'provider' });
 * console.log(dccEntity) // { entity: 'trustly', identifier: 'provider', dccEnabled: true };
 *
 * @param {Object} args - get entity from instrument parameters
 * @param {string} args.instrument - instrument type
 * @param {string} args.identifier - identifier type
 *
 * @returns {{entity: string, identifier: string, dccEnabled: boolean}} - DCC entity with identifier
 */
export const getEntityFromInstrument = ({
  instrument,
  identifier,
}: Pick<DCC.Props, 'instrument' | 'identifier'>) => {
  const entityType: {
    entity: DCC.Props['entity'];
    identifier: DCC.Props['identifier'];
    dccEnabled: DCC.Props['dccEnabled'];
  } = {
    entity: null,
    identifier,
    dccEnabled: false,
  };

  if (!instrument || !identifier) {
    return entityType;
  }

  switch (identifier) {
    case MethodIdentifiers.iin: {
      if (typeof instrument === 'string') {
        const iin = getIin(instrument);
        if (iin.length >= 6) {
          entityType.entity = iin;
          entityType.dccEnabled = true;
        }
      }
      return entityType;
    }

    case MethodIdentifiers.tokenId: {
      if (typeof instrument === 'object') {
        if (instrument.id) {
          entityType.entity = instrument.id;
          entityType.dccEnabled = instrument.dcc_enabled;
        } else if (instrument.token_id) {
          const card = getCardByTokenId(instrument.token_id);

          if (card && card.id) {
            entityType.entity = card.id;
            entityType.dccEnabled = card.dcc_enabled;
          }
        }
        return entityType;
      }

      if (typeof instrument === 'string') {
        const card = getCardByTokenId(instrument);

        if (card && card.id) {
          entityType.entity = card.id;
          entityType.dccEnabled = card.dcc_enabled;
        }
      }

      return entityType;
    }

    default: {
      if (typeof instrument === 'string') {
        entityType.entity = instrument;
        entityType.dccEnabled = true;
      }
      return entityType;
    }
  }
};

/**
 * A wrapper function over getEntityFromInstrument, which takes Card screen views and instruments and return DCC entity.
 *
 * @public
 *
 * @example
 * // 1. Card number
 * $cardNumber = '4242424242424242';
 *
 * const dccEntity = getEntityFromCardInstrument({ view: 'ADD_CARD', cardNumber: $cardNumber });
 * console.log(dccEntity) // { entity: '424242', identifier: 'iin', dccEnabled: true }
 *
 * @example
 * // 2. Selected instrument from home screen
 * $selectedInstrument = { token_id: 'token_2jf' };
 *
 * const dccEntity = getEntityFromCardInstrument({ view: 'HOME_SCREEN', cardNumber: $selectedInstrument });
 * console.log(dccEntity) // { entity: 'token_2jf', identifier: 'tokenId', dccEnabled: true };
 *
 * @param {Object} cardInput - card method input parameters
 * @param {CardViews | string} cardInput.view - card payment method view, i.e SAVED_CARD, ADD_CARD
 * @param {DCC.Props['instrument']} cardInput.cardNumber - if it is a ADD_CARD view then provide cardNumber
 * @param {DCC.Props['instrument']} cardInput.selectedCard - provide selected card from saved card screen
 * @param {DCC.Props['instrument']} cardInput.selectedInstrument - provide selected instrument if coming from home screen
 *
 * @returns {{entity: string, identifier: string, dccEnabled: boolean}} - DCC entity with identifier
 */
export const getEntityFromCardInstrument = ({
  view,
  cardNumber,
  selectedCard,
  selectedInstrument,
}: {
  view: CardViews | string;
  cardNumber?: DCC.Props['instrument'];
  selectedCard?: DCC.Props['instrument'];
  selectedInstrument?: DCC.Props['instrument'];
}) => {
  let instrument: DCC.Props['instrument'] = null;
  let identifier: DCC.Props['identifier'] = '';

  if (view === CardViews.ADD_CARD && cardNumber) {
    identifier = 'iin';
    instrument = cardNumber;
  } else if (view === CardViews.SAVED_CARDS && selectedCard) {
    identifier = 'tokenId';
    instrument = selectedCard;
  } else if (view === CardViews.HOME_SCREEN && selectedInstrument) {
    identifier = 'tokenId';
    instrument = selectedInstrument;
  }
  return getEntityFromInstrument({ identifier, instrument });
};

/**
 * Helper function to get dcc payload for create payment api based on payment method
 * @param {string} method
 *
 * @returns {DCC.PayloadStore} returns dcc payload for particular payment method
 */
export const getDCCPayloadForRequest = (
  method: DCC.PayloadStore['method']
): DCC.PayloadStore | null => {
  const dccPayload = getDCCPayloadData();

  if (
    (dccPayload.method && dccPayload.method === method) ||
    !dccPayload.method
  ) {
    return dccPayload;
  }

  return null;
};

/**
 * Helper function to add/remove dcc payload data on create payment request object
 *
 * @param {DCC.PaymentRequestData} data - request payload data
 * @returns {DCC.PaymentRequestData} - returns modified request payload data
 */
export const addDCCPayloadOnRequest = (data: DCC.PaymentRequestData = {}) => {
  const dccPayload = getDCCPayloadForRequest(data?.method);

  if (dccPayload && dccPayload.enable && dccPayload.currency_request_id) {
    data.currency_request_id = dccPayload.currency_request_id;
    data.dcc_currency = dccPayload.selectedCurrency;
    data.default_dcc_currency = dccPayload.defaultCurrency;
  } else {
    delete data.currency_request_id;
    delete data.dcc_currency;
    delete data.default_dcc_currency;
  }

  return data;
};

/**
 * Helper function to get DCC amount, if DCC is applied on the payment method
 *
 * @param {string} method payment method
 * @returns {number | null} dcc amount or null
 */
export const getDCCAmountIfApplied = (method?: DCC.PayloadStore['method']) => {
  const dccPayload = getDCCPayloadForRequest(method);

  if (dccPayload) {
    return (
      dccPayload.currencies?.find(
        (curr) => curr._key === dccPayload.selectedCurrency
      )?.amount ?? null
    );
  }

  return null;
};
