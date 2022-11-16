// utils
import { customer } from 'checkoutstore/customer';

// constants
import { CardViews } from '../constants';

// store
import { resetDCCPayload, setDCCPayload } from '../store';

// testable helpers
import {
  getCardByTokenId,
  sortDCCCurrencies,
  getEntityFromInstrument,
  getEntityFromCardInstrument,
  getDCCPayloadForRequest,
  addDCCPayloadOnRequest,
  getDCCAmountIfApplied,
} from '../helpers';

// test data
import {
  sortedCurrencies,
  successResponse,
} from '../testsData/currenciesResponse';

describe('Test getCardByTokenId', () => {
  test('should return undefined if customer store is empty', () => {
    customer.set({});

    expect(getCardByTokenId('token_121')).toStrictEqual(undefined);
  });
  test('should return undefined if customer store has invalid values', () => {
    customer.set({ items: [] });
    expect(getCardByTokenId('token_121')).toStrictEqual(undefined);

    customer.set({ tokens: { items: null } });
    expect(getCardByTokenId('token_121')).toStrictEqual(undefined);

    customer.set({ tokens: { items: [] } });
    expect(getCardByTokenId('token_121')).toStrictEqual(undefined);
  });
  test('should return token if customer store has valid values', () => {
    customer.set({
      tokens: {
        items: [
          { id: 'token_130', dcc_enabled: false },
          { id: 'token_131', dcc_enabled: true },
        ],
      },
    });
    expect(getCardByTokenId('token_121')).toStrictEqual(undefined);
    expect(getCardByTokenId('token_130')).toStrictEqual({
      dcc_enabled: false,
      id: 'token_130',
    });
  });
});

describe('Test getEntityFromInstrument', () => {
  test('should return default entity if identifier and instrument are invalid', () => {
    const dccEntity = getEntityFromInstrument({
      identifier: 'id',
      instrument: null,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'id',
      dccEnabled: false,
    });
  });
  test('should return default entity if instrument is card number and identifier is invalid', () => {
    let dccEntity = getEntityFromInstrument({
      identifier: 'id',
      instrument: '4242424242424242',
    });
    expect(dccEntity).toStrictEqual({
      entity: '4242424242424242',
      identifier: 'id',
      dccEnabled: true,
    });

    dccEntity = getEntityFromInstrument({
      identifier: '',
      instrument: '4242424242424242',
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: '',
      dccEnabled: false,
    });
  });
  test('should return iin entity if instrument is card number', () => {
    let dccEntity = getEntityFromInstrument({
      identifier: 'iin',
      instrument: '4242424242424242',
    });
    expect(dccEntity).toStrictEqual({
      entity: '424242',
      identifier: 'iin',
      dccEnabled: true,
    });
    dccEntity = getEntityFromInstrument({
      identifier: 'iin',
      instrument: '4242',
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'iin',
      dccEnabled: false,
    });
  });
  test('should return default entity if instrument is saved card and identifier is invalid', () => {
    const savedCard = { id: 'token_3jkfh', dcc_enabled: false };
    let dccEntity = getEntityFromInstrument({
      identifier: 'iin',
      instrument: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'iin',
      dccEnabled: false,
    });
    dccEntity = getEntityFromInstrument({
      identifier: '',
      instrument: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: '',
      dccEnabled: false,
    });
  });
  test('should return tokenId entity if instrument is saved card', () => {
    const savedCard = { id: 'token_3jkfh', dcc_enabled: false };

    let dccEntity = getEntityFromInstrument({
      identifier: 'tokenId',
      instrument: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_3jkfh',
      identifier: 'tokenId',
      dccEnabled: false,
    });

    // if saved card has dcc_enabled true
    savedCard.dcc_enabled = true;

    dccEntity = getEntityFromInstrument({
      identifier: 'tokenId',
      instrument: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_3jkfh',
      identifier: 'tokenId',
      dccEnabled: true,
    });
  });
  test('should return tokenId entity if instrument has token_id', () => {
    const selectedInstrument = { token_id: 'token_131' };

    // if customer does not have tokens
    customer.set({});

    let dccEntity = getEntityFromInstrument({
      identifier: 'tokenId',
      instrument: selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'tokenId',
      dccEnabled: false,
    });

    // if customer has tokens
    customer.set({
      tokens: {
        items: [
          { id: 'token_131', dcc_enabled: false },
          { id: 'token_131', dcc_enabled: true },
        ],
      },
    });

    dccEntity = getEntityFromInstrument({
      identifier: 'tokenId',
      instrument: selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_131',
      identifier: 'tokenId',
      dccEnabled: false,
    });

    customer.set({
      tokens: {
        items: [
          { id: 'token_130', dcc_enabled: false },
          { id: 'token_131', dcc_enabled: true },
        ],
      },
    });

    dccEntity = getEntityFromInstrument({
      identifier: 'tokenId',
      instrument: selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_131',
      identifier: 'tokenId',
      dccEnabled: true,
    });
  });
});

describe('Test getEntityFromCardInstrument', () => {
  test('should return default entity if identifier and instrument are invalid', () => {
    const dccEntity = getEntityFromCardInstrument({
      view: CardViews.ADD_CARD,
      cardNumber: null,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: '',
      dccEnabled: false,
    });
  });
  test('should return iin entity if instrument is card number', () => {
    let dccEntity = getEntityFromCardInstrument({
      view: CardViews.ADD_CARD,
      cardNumber: '4242424242424242',
    });
    expect(dccEntity).toStrictEqual({
      entity: '424242',
      identifier: 'iin',
      dccEnabled: true,
    });
    dccEntity = getEntityFromCardInstrument({
      view: CardViews.ADD_CARD,
      cardNumber: '42424',
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'iin',
      dccEnabled: false,
    });
  });
  test('should return tokenId entity if instrument is saved card', () => {
    const savedCard = { id: 'token_3jkfh', dcc_enabled: false };

    let dccEntity = getEntityFromCardInstrument({
      view: CardViews.SAVED_CARDS,
      selectedCard: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_3jkfh',
      identifier: 'tokenId',
      dccEnabled: false,
    });

    // if saved card has dcc_enabled true
    savedCard.dcc_enabled = true;

    dccEntity = getEntityFromCardInstrument({
      view: CardViews.SAVED_CARDS,
      selectedCard: savedCard,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_3jkfh',
      identifier: 'tokenId',
      dccEnabled: true,
    });
  });
  test('should return tokenId entity if instrument has token_id', () => {
    const selectedInstrument = { token_id: 'token_131' };

    // if customer does not have tokens
    customer.set({});

    let dccEntity = getEntityFromCardInstrument({
      view: CardViews.HOME_SCREEN,
      selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: null,
      identifier: 'tokenId',
      dccEnabled: false,
    });

    // if customer has tokens
    customer.set({
      tokens: {
        items: [
          { id: 'token_131', dcc_enabled: false },
          { id: 'token_131', dcc_enabled: true },
        ],
      },
    });

    dccEntity = getEntityFromCardInstrument({
      view: CardViews.HOME_SCREEN,
      selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_131',
      identifier: 'tokenId',
      dccEnabled: false,
    });

    customer.set({
      tokens: {
        items: [
          { id: 'token_130', dcc_enabled: false },
          { id: 'token_131', dcc_enabled: true },
        ],
      },
    });

    dccEntity = getEntityFromCardInstrument({
      view: CardViews.HOME_SCREEN,
      selectedInstrument,
    });
    expect(dccEntity).toStrictEqual({
      entity: 'token_131',
      identifier: 'tokenId',
      dccEnabled: true,
    });
  });
});

describe('Test sortDCCCurrencies', () => {
  const testData = {
    defaultCurrency: 'USD',
    currency: 'IND',
    allCurrencies: successResponse.all_currencies,
  };
  test('should return sorted currencies list', () => {
    expect(sortDCCCurrencies(testData)).toStrictEqual({
      defaultCurrency: 'USD',
      currencies: sortedCurrencies,
      amount: 100,
    });
  });
  test('should return empty list if all currencies is empty', () => {
    expect(sortDCCCurrencies({ ...testData, allCurrencies: {} })).toStrictEqual(
      { defaultCurrency: 'USD', currencies: [], amount: 0 }
    );
  });
  test('should select different top currencies if both defaultCurrency and currency are same', () => {
    expect(
      sortDCCCurrencies({
        defaultCurrency: 'USD',
        currency: 'USD',
        allCurrencies: testData.allCurrencies,
      })
    ).toStrictEqual({
      defaultCurrency: 'USD',
      currencies: sortedCurrencies,
      amount: 100,
    });
  });
  test('should return valid default currency if defaultCurrency is undefined or not present in list', () => {
    expect(
      sortDCCCurrencies({
        defaultCurrency: undefined,
        currency: 'INR',
        allCurrencies: testData.allCurrencies,
      })
    ).toStrictEqual({
      defaultCurrency: 'CAD',
      amount: 147,
      currencies: Object.entries(testData.allCurrencies).map(
        ([currency, meta]) => ({
          ...meta,
          _key: currency,
          currency,
        })
      ),
    });
  });
});

describe('Test getDCCPayloadForRequest', () => {
  test('should return empty dcc payload', () => {
    expect(getDCCPayloadForRequest('card')).toStrictEqual({});
  });
  test('should return empty dcc payload', () => {
    setDCCPayload({
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
      method: 'card',
    });
    expect(getDCCPayloadForRequest('card')).toStrictEqual({
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
      method: 'card',
    });
  });
});

describe('Test addDCCPayloadOnRequest', () => {
  test('should add dcc payload if method is set on dcc', () => {
    resetDCCPayload();
    expect(addDCCPayloadOnRequest({ method: 'card' })).toStrictEqual({
      method: 'card',
    });
  });
  test('should add dcc payload if dcc method is equal to payment method', () => {
    resetDCCPayload();
    setDCCPayload({
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
      method: 'paypal',
    });
    const data = { method: 'paypal' };
    addDCCPayloadOnRequest(data);

    expect(data).toStrictEqual({
      currency_request_id: 'abc',
      default_dcc_currency: 'USD',
      dcc_currency: 'EUR',
      method: 'paypal',
    });
  });
  test('should remove dcc payload from request data if currency request id not present', () => {
    resetDCCPayload();
    setDCCPayload({
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
      method: 'paypal',
    });
    const data = { method: 'paypal' };
    addDCCPayloadOnRequest(data);

    expect(data).toStrictEqual({
      currency_request_id: 'abc',
      default_dcc_currency: 'USD',
      dcc_currency: 'EUR',
      method: 'paypal',
    });

    setDCCPayload({
      defaultCurrency: 'KWD',
      selectedCurrency: 'GBP',
      enable: false,
      method: 'trustly',
    });

    addDCCPayloadOnRequest(data);
    expect(data).toStrictEqual({ method: 'paypal' });
  });
});

describe('Test getDCCAmountIfApplied', () => {
  test('should return null', () => {
    resetDCCPayload();
    expect(getDCCAmountIfApplied()).toStrictEqual(null);
  });
  test('should return dcc amount', () => {
    resetDCCPayload();
    setDCCPayload({
      currencies: sortedCurrencies,
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
    });
    expect(getDCCAmountIfApplied()).toStrictEqual(109);
  });
  test('should return dcc amount with method', () => {
    resetDCCPayload();
    setDCCPayload({
      currencies: sortedCurrencies,
      currency_request_id: 'abc',
      defaultCurrency: 'USD',
      selectedCurrency: 'EUR',
      enable: true,
      method: 'card',
    });
    expect(getDCCAmountIfApplied('card')).toStrictEqual(109);
  });
});
