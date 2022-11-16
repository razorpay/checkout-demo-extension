import { get } from 'svelte/store';
import { customer } from 'checkoutstore/customer';
import type { Customer, Instrument, Tokens } from 'emiV2/types';
import { filterSavedCardsAgainstCustomBlock } from 'emiV2/helper/configurability';
import { getSavedCardsForEMI } from 'emiV2/helper/card';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getOrderMethod: () => 'emi',
}));

describe('validate SavedCards', () => {
  let currentCustomer = get(customer) as Customer;

  let tokens: Tokens[] = [];

  customer.set({
    email: 'test@razorpay.com',
    contact: '+918111111111',
    tokens: {
      entity: 'collection',
      count: 2,
      items: [
        {
          id: 'token_HMpQW2ILsIXGxA',
          entity: 'token',
          token: 'DlK0TQeEFlUtcH',
          bank: null,
          wallet: null,
          method: 'card',
          consent_taken: false,
          card: {
            country: 'US',
            entity: 'card',
            name: 'user',
            last4: '7369',
            network: 'Visa',
            type: 'debit',
            issuer: 'ICIC',
            international: true,
            emi: true,
            sub_type: 'consumer',
            expiry_month: 12,
            expiry_year: 2023,
            flows: {
              recurring: false,
              iframe: false,
            },
          },
          vpa: null,
          recurring: false,
          recurring_details: {
            status: 'not_applicable',
            failure_reason: null,
          },
          auth_type: null,
          mrn: null,
          used_at: 1630040299,
          created_at: 1623649462,
          expired_at: 1704047399,
          dcc_enabled: false,
        },
        {
          id: 'token_DxGzKR9hjdARiF',
          entity: 'token',
          token: '5XL7Oe8G9jWDqI',
          bank: null,
          wallet: null,
          method: 'card',
          consent_taken: false,
          card: {
            entity: 'card',
            name: 'Siddharth',
            last4: '8882',
            network: 'MasterCard',
            type: 'credit',
            issuer: 'HDFC',
            international: false,
            expiry_month: 12,
            expiry_year: 2022,
            flows: { otp: true, recurring: true, iframe: false },
          },
          vpa: null,
          recurring: false,
          auth_type: null,
          mrn: null,
          used_at: 1577458421,
          created_at: 1577458420,
          expired_at: 1672511399,
        },
      ],
    },
  });

  currentCustomer = get(customer) as Customer;

  tokens = getSavedCardsForEMI(currentCustomer);

  test('If user has saved cards', () => {
    expect(tokens.length).toBe(2);
  });

  let instrument: Instrument = {
    method: 'cardless_emi',
    id: '12345',
    skipCTAClick: false,
    _type: 'instrument',
    section: 'custom',
  };

  let filteredTokens: Tokens[] = [];

  test('selected instrument is cardless provider', () => {
    currentCustomer = get(customer) as Customer;
    tokens = getSavedCardsForEMI(currentCustomer);

    filteredTokens = filterSavedCardsAgainstCustomBlock(tokens, instrument);
    expect(filteredTokens.length).toBe(0);
  });

  test('selected instrument is emi provider', () => {
    instrument = {
      method: 'emi',
      id: '12345',
      skipCTAClick: false,
      _type: 'instrument',
      section: 'custom',
    };

    filteredTokens = filterSavedCardsAgainstCustomBlock(tokens, instrument);
    expect(filteredTokens.length).toBe(2);

    instrument = {
      method: 'emi',
      id: '12345',
      skipCTAClick: false,
      _type: 'instrument',
      section: 'custom',
      issuers: ['HDFC'],
    };

    filteredTokens = filterSavedCardsAgainstCustomBlock(tokens, instrument);
    expect(filteredTokens.length).toBe(1);

    instrument = {
      method: 'emi',
      id: '12345',
      skipCTAClick: false,
      _type: 'instrument',
      section: 'custom',
      types: ['credit'],
    };

    filteredTokens = filterSavedCardsAgainstCustomBlock(tokens, instrument);
    expect(filteredTokens.length).toBe(1);
  });
});
