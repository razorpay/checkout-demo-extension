import { filterInstrumentsForUPIAndSavedCards } from '../filters';
import { isRecurring } from 'razorpay';

const instruments = [
  {
    method: 'upi',
    vpa: 'demouser@upi',
    '_[flow]': 'directpay',
    token_id: 'token_HLG2GeB36JIUTV',
  },
  {
    method: 'upi',
    '_[flow]': 'intent',
    '_[upiqr]': '1',
  },
  {
    method: 'card',
    token_id: 'card',
  },
  {
    method: 'upi',
    vpa: 'demodemo@oksbi',
    '_[flow]': 'directpay',
  },
  {
    method: 'card',
    issuer: 'ICIC',
    type: 'debit',
    network: 'MasterCard',
    token_id: 'token_IX0eHpWWrEWRTG',
  },
  {
    method: 'wallet',
    wallet: 'phonepe',
  },
  {
    method: 'upi',
    vpa: '@ybl',
    '_[flow]': 'intent',
    upi_app: 'com.phonepe.app',
    vendor_vpa: '@ybl',
  },
  {
    method: 'wallet',
    wallet: 'mobikwik',
  },
  null,
  null,
  {
    method: 'upi',
    vpa: '@paytm',
    '_[flow]': 'intent',
    upi_app: 'net.one97.paytm',
    vendor_vpa: '@paytm',
  },
  {
    method: 'netbanking',
    bank: 'SBIN',
  },
  {
    method: 'netbanking',
    bank: 'HDFC',
  },
  {
    method: 'emi',
    token_id: 'card',
  },
  null,
];

const customer = {
  contact: '+919999999999',
  tokens: {
    items: [
      {
        id: 'token_IX0eHpWWrEWRTG',
        token: 'IX0eHFEWQEWRTG',
        method: 'card',
        card: {
          entity: 'card',
          name: 'Demo user',
          last4: '1234',
          network: 'MasterCard',
          type: 'debit',
        },
      },
      {
        id: 'token_HLG2GeB36JIUTV',
        token: '4OYNf2A7sDstHy',
        method: 'upi',
        vpa: {
          username: 'demouser',
          handle: 'upi',
          name: 'Demo User',
          status: 'valid',
        },
      },
    ],
  },
  logged: true,
};

jest.mock('razorpay', () => ({
  isRecurring: jest.fn((cb) => (cb ? cb() : false)),
}));

jest.mock('checkoutstore', () => ({
  shouldRememberCustomer: () => true,
}));

jest.mock('checkoutstore/methods', () => ({
  isMethodEnabled: () => true,
  isCreditCardEnabled: () => true,
  isDebitCardEnabled: () => true,
}));

describe('Personalization filter', () => {
  test('should filter out falsy instruments', () => {
    isRecurring.mockImplementation(() => false);

    const filteredInstruments = filterInstrumentsForUPIAndSavedCards({
      instruments,
      upiApps: [],
      customer,
    });

    expect(filteredInstruments).not.toContain(null);
  });

  test('should filter out card instrument in case of recurring', () => {
    isRecurring.mockImplementation(() => true);

    const filteredInstruments = filterInstrumentsForUPIAndSavedCards({
      instruments,
      upiApps: [],
      customer,
    });

    expect(filteredInstruments).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          issuer: 'ICIC',
          type: 'debit',
          network: 'MasterCard',
        }),
      ])
    );
  });

  test('should filter out QR instrument in case of UPI', () => {
    isRecurring.mockImplementation(() => false);

    const filteredInstruments = filterInstrumentsForUPIAndSavedCards({
      instruments,
      upiApps: [],
      customer,
    });

    expect(filteredInstruments).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          method: 'upi',
          '_[flow]': 'intent',
          '_[upiqr]': '1',
        }),
      ])
    );
  });

  test('should filter out all method instrument except upi and card', () => {
    isRecurring.mockImplementation(() => false);

    const filteredInstruments = filterInstrumentsForUPIAndSavedCards({
      instruments,
      upiApps: [],
      customer,
    });

    expect(filteredInstruments).toHaveLength(4);
    expect(filteredInstruments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          vpa: 'demouser@upi',
          '_[flow]': 'directpay',
        }),
        expect.objectContaining({ vpa: '@paytm', '_[flow]': 'intent' }),
        expect.objectContaining({ vpa: '@ybl', '_[flow]': 'intent' }),
        expect.objectContaining({
          issuer: 'ICIC',
          type: 'debit',
          network: 'MasterCard',
        }),
      ])
    );
  });
});
