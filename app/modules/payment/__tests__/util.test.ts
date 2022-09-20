import { customer } from 'checkoutstore/customer';
import { selectedInstrument } from 'checkoutstore/screens/home';
import { getInstrumentDataAfterSubmitClick } from 'payment/utils';

jest.mock('checkoutstore/screens/home', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('checkoutstore/screens/home');
  const secondModule = jest.requireActual('checkoutstore/customer');
  return {
    __esModule: true,
    ...originalModule,
    ...secondModule,
    selectedInstrument: writable(),
    customer: writable(),
  };
});

describe('Instrument Detail for Submit Event', () => {
  test('for wallet payment', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'wallet',
          method: 'wallet',
        },
      ],
      _type: 'method',
      code: 'wallet',
      method: 'wallet',
      id: 'b740feb2_rzp.cluster_1_3_wallet_true',
    });
    const data = {
      contact: '+919912054784',
      email: 'nandakishor.j9@gmail.com',
      method: 'wallet',
      wallet: 'phonepe',
      amount: 550000,
    };
    const expectedResult = {
      method: { name: 'wallet' },
      instrument: { name: 'phonepe', personalisation: false, saved: false },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for card with card number', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'card',
          method: 'card',
        },
      ],
      _type: 'method',
      code: 'card',
      method: 'card',
      id: 'b740feb2_rzp.cluster_1_0_card_true',
    });
    const data = {
      contact: '+919912054784',
      email: 'nandakishor.j9@gmail.com',
      method: 'card',
      'card[number]': '4111111111111111',
      'card[expiry]': '11 / 23',
      'card[cvv]': '123',
      'card[name]': 'QARazorpay',
      amount: 550000,
    };
    const expectedResult = {
      method: {
        name: 'card',
      },
      instrument: {
        issuer: '',
        personalisation: false,
        saved: false,
        network: '',
        type: '',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for card with card token from personalization', () => {
    //@ts-ignore
    selectedInstrument.set({
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      consent_taken: false,
      id: 'KFUcmVQkdqQSg7',
      issuers: ['ICIC'],
      meta: { preferred: true },
      method: 'card',
      networks: ['Visa'],
      section: 'p13n',
      skipCTAClick: false,
      token_id: 'token_HMpQW2ILsIXGxA',
      types: ['debit'],
    });
    customer.set({
      contact: '+919912054784',
      customer_id: undefined,
      haveSavedCard: true,
      logged: true,

      tokens: {
        entity: 'collection',
        count: 4,
        items: [
          {
            id: 'token_HMpQW2ILsIXGxA',
            token: 'DlK0TQeEFlUtcH',
            method: 'card',
            card: {
              entity: 'card',
              last4: '7369',
              network: 'Visa',
              type: 'debit',
              issuer: 'ICIC',
              networkCode: 'visa',
            },
          },
          {
            id: 'token_EGADb8swOCgtto',
            token: 'GdRdKb81MWAp3e',
            method: 'card',
            card: {
              entity: 'card',
              name: 'Siddharth Goswami',
              last4: '0176',
              network: 'MasterCard',
              type: 'debit',
              issuer: 'HDFC',
              networkCode: 'mastercard',
            },
          },
        ],
      },
    });
    const data = {
      contact: '+919912054784',
      email: 'nandakishor.j9@gmail.com',
      amount: 550000,
      'card[cvv]': '123',
      method: 'card',
      token: 'DlK0TQeEFlUtcH',
    };
    const expectedResult = {
      method: {
        name: 'card',
      },
      instrument: {
        issuer: 'ICIC',
        personalisation: true,
        saved: true,
        network: 'Visa',
        type: 'debit',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });

  test('for upi intent collect payment', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'upi',
          method: 'upi',
        },
      ],
      _type: 'method',
      code: 'upi',
      method: 'upi',
      id: 'b740feb2_rzp.cluster_1_1_upi_true',
    });
    customer.set({
      contact: '+919912054784',
      customer_id: undefined,
      haveSavedCard: true,
      logged: true,

      tokens: {
        entity: 'collection',
        count: 4,
        items: [
          {
            id: 'token_GpaXi2JbdnNQo4',
            entity: 'token',
            token: '8NHRLBA1JXAzVN',
            method: 'upi',
            vpa: {
              username: 'nanda120idbi',
              handle: 'ybl',
              name: 'NANDA KISHOR JERIPOTHULA',
              status: 'valid',
            },
          },
        ],
      },
    });
    const data = {
      contact: '+919912054784',
      email: 'nandakishor.j9@gmail.com',
      method: 'upi',
      token: '8NHRLBA1JXAzVN',
      upi: {
        flow: 'collect',
      },
      '_[flow]': 'directpay',
      amount: 550000,
    };
    const expectedResult = {
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'PhonePe',
        personalisation: false,
        saved: true,
        type: 'collect',
        vpa: '@ybl',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
});
