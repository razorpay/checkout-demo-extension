import {
  overrideStorageInstruments,
  getAllInstrumentsForCustomer,
  getExtractedDetails,
  getOrCreateInstrument,
  recordSuccess,
  hasAnyInstrumentsOnDevice,
  processInstrument,
} from 'checkoutframe/personalization';
import * as UA from 'common/useragent';
import type { Personalization } from 'checkoutframe/personalization/personalization';
import { customer } from 'checkoutframe/personalization/__mocks__/customer-params';
import { getAllInstruments } from 'checkoutframe/personalization/utils';
import { getUPIIntentApps } from 'checkoutstore/native';
import { getCustomer } from 'checkoutframe/customer';

jest.mock('common/useragent', () => ({
  ...jest.requireActual('common/useragent'),
  isDesktop: jest.fn(),
}));

jest.mock('checkoutframe/personalization/utils', () => ({
  ...jest.requireActual('checkoutframe/personalization/utils'),
  getAllInstruments: jest.fn(() => {}),
}));

jest.mock('checkoutstore/native', () => ({
  ...jest.requireActual('checkoutstore/native'),
  getUPIIntentApps: jest.fn(() => {}),
}));

jest.mock('checkoutframe/customer', () => ({
  ...jest.requireActual('checkoutframe/customer'),
  getCustomer: jest.fn(() => {}),
}));

const isDesktop = UA.isDesktop as jest.MockedFunction<typeof UA.isDesktop>;
const instruments: Personalization.V1_Instrument_Raw[] = [
  {
    frequency: 2,
    id: 'JOrD5cf04GCWn4',
    success: false,
    timestamp: 1651166628986,
    '_[flow]': 'intent',
    method: 'upi',
  },
  {
    frequency: 1,
    id: 'JVcOwmYGtUfF3H',
    method: 'upi',
    success: false,
    timestamp: 1652642826065,
    token_id: 'token_HrUHnt4GIx9Q3p',
    vpa: '8344881425@upi',
    '_[flow]': 'directpay',
  },
  {
    frequency: 20,
    id: 'JT4Zjzs1nUiGCq',
    success: true,
    timestamp: 1652698924736,
    bank: 'SBIN',
    method: 'netbanking',
  },
];

const PHONEPE_WALLET_STORAGE_INSTRUMENT = {
  frequency: 4,
  id: 'JMPUBLKOcwFWlK',
  method: 'wallet',
  success: true,
  timestamp: 1651212306144,
  wallet: 'phonepe',
};
const PHONEPE_UPI_STORAGE_INSTRUMENT = {
  ...PHONEPE_WALLET_STORAGE_INSTRUMENT,
  '_[flow]': 'intent',
  method: 'upi',
  upi_app: 'com.phonepe.app',
};
delete (PHONEPE_UPI_STORAGE_INSTRUMENT as any)['wallet'];

describe('Module: personalization', () => {
  describe('P13N V1 - Storage Based', () => {
    describe('overrideStorageInstruments', () => {
      test('Non phonepe-wallet instruments should be passed through as is', () => {
        const updatedInstruments = overrideStorageInstruments(instruments);

        expect(updatedInstruments).toHaveLength(instruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining(
            instruments.map((i) => expect.objectContaining(i))
          )
        );
      });

      test('Phonepe-wallet instruments should be modified to PhonePe UPI Intent Instrument in non-desktop', () => {
        isDesktop.mockReturnValue(false);
        const customInstruments = [PHONEPE_WALLET_STORAGE_INSTRUMENT];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(PHONEPE_UPI_STORAGE_INSTRUMENT),
          ])
        );
      });

      test('Phonepe-wallet instruments should be modified to PhonePe UPI Intent Instrument in desktop', () => {
        isDesktop.mockReturnValue(true);
        const customInstruments = [PHONEPE_WALLET_STORAGE_INSTRUMENT];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...PHONEPE_UPI_STORAGE_INSTRUMENT,
              vendor_vpa: '@ybl',
            }),
          ])
        );
      });

      test('Combination of Phonepe-wallet + other instruments should be modified to PhonePe UPI + instruments', () => {
        isDesktop.mockReturnValue(false);
        const customInstruments = [
          PHONEPE_WALLET_STORAGE_INSTRUMENT,
          ...instruments,
        ];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(PHONEPE_UPI_STORAGE_INSTRUMENT),
            ...instruments.map((i) => expect.objectContaining(i)),
          ])
        );
      });
    });
  });
  describe('Tests for getExtractedDetails under index.js', () => {
    it('should return all the instruments for a given customer', () => {
      const instruments = {
        b5604f31: [
          {
            frequency: 2,
            id: 'KjmhMqjQ3akgU7',
            success: false,
            timestamp: 1669273040119,
            method: 'card',
            token_id: 'token_KGw40fGGndjddR',
            type: 'prepaid',
            issuer: 'STCB',
            network: 'Visa',
          },
        ],
      };
      (getAllInstruments as unknown as jest.Mock).mockReturnValue(instruments);
      expect(getAllInstrumentsForCustomer(customer)).toEqual(
        instruments.b5604f31
      );
    });
    it('should return details when provided with a customer and payment details using upi qr as method', () => {
      const expectedReturnValue = {
        '_[flow]': 'intent',
        '_[upiqr]': '1',
        method: 'upi',
      };
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        method: 'upi',
        upi: {
          flow: 'intent',
        },
        '_[flow]': 'intent',
        amount: 600000,
        '_[upiqr]': '1',
      };
      expect(getExtractedDetails(paymentDetails, customer)).toEqual(
        expectedReturnValue
      );
    });
    it('should return details when provided with a customer and payment details using card as method', () => {
      const paymentDetails = {
        contact: '+918708857906',
        email: 'prabhjeetkalsi00@gmail.com',
        method: 'card',
        'card[number]': '4111111111111111',
        'card[expiry]': '03 / 33',
        'card[cvv]': '333',
        'card[name]': 'Prabhjeet Kalsi',
        amount: 600000,
      };
      expect(getExtractedDetails(paymentDetails, customer)).toBeUndefined();
    });
    it('should return details when provided with a customer and payment details using tokenized card as method', () => {
      const expectedReturnValue = {
        method: 'card',
        token_id: 'token_KpObKSMsmgBxEZ',
        type: 'debit',
        issuer: 'SBIN',
        network: 'Visa',
      };
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        method: 'card',
        token: '9yFY5et5rijcsp',
        'card[cvv]': '111',
        amount: 100,
      };
      expect(getExtractedDetails(paymentDetails, customer)).toEqual(
        expectedReturnValue
      );
    });
    it('should return undefined as provided payment card token is not correct', () => {
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        method: 'card',
        token: '9yFY5et5rijcsj',
        'card[cvv]': '111',
        amount: 100,
      };
      expect(getExtractedDetails(paymentDetails, customer)).toBeUndefined();
    });
    it('should return correct details when provided customer data and payment details using upi intent as method', () => {
      const expectedReturnValue = {
        app_icon: undefined,
        app_name: 'Google Pay',
        method: 'upi',
        upi_app: 'gpay',
      };
      const paymentDetails = {
        method: 'upi',
        upi_app: 'gpay',
      };
      (getUPIIntentApps as unknown as jest.Mock).mockReturnValue({
        all: [{ package_name: 'gpay', app_name: 'Google Pay' }],
      });
      expect(getExtractedDetails(paymentDetails, customer)).toEqual(
        expectedReturnValue
      );
    });
    it('should return undefined as not method is passed in payment details', () => {
      expect(getExtractedDetails({}, customer)).toBeUndefined();
    });
    it('should return correct details when passed customer data and payment details using upi direct pay as method', () => {
      const expectedReturnValue = {
        '_[flow]': 'directpay',
        method: 'upi',
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00@oksbi',
      };
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        amount: 100,
        method: 'upi',
        token: 'HDgNLcP3NmtD52',
        '_[flow]': 'directpay',
      };
      expect(getExtractedDetails(paymentDetails, customer)).toEqual(
        expectedReturnValue
      );
    });
    it('should return undefined using upi direct pay as method as token is not correct', () => {
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        amount: 100,
        method: 'upi',
        token: 'HDgNLcP3rmtD52',
        '_[flow]': 'directpay',
      };
      expect(getExtractedDetails(paymentDetails, customer)).toBeUndefined();
    });
  });
  describe('Tests for getOrCreateInstrument under index.js', () => {
    it('should return undefined as no payment details have been passed', () => {
      expect(getOrCreateInstrument([], {}, customer, {})).toBeUndefined();
    });
    it('should return the existing payment method', () => {
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        amount: 100,
        method: 'upi',
        token: 'HDgNLcP3NmtD52',
        '_[flow]': 'directpay',
      };
      const instruments = [
        {
          frequency: 9,
          id: 'KjscHbhxbaguXc',
          success: false,
          timestamp: 1670569101245,
          '_[flow]': 'directpay',
          method: 'upi',
          token_id: 'token_KEB4PhxxYwqgZK',
          vpa: 'prabhjeetkalsi00@oksbi',
        },
      ];
      expect(
        getOrCreateInstrument(instruments, paymentDetails, customer, {})
      ).toEqual(instruments[0]);
    });
    it('should return a new instrument', () => {
      const expectedReturnValue = {
        frequency: 0,
        id: expect.anything(),
        success: false,
        timestamp: expect.anything(),
        wallet: 'phonepe',
        method: 'wallet',
      };
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        method: 'wallet',
        wallet: 'phonepe',
        amount: 100,
      };
      expect(getOrCreateInstrument([], paymentDetails, customer, {})).toEqual(
        expectedReturnValue
      );
    });
  });
  describe('Tests for recordSuccess under index.js', () => {
    it('should return undefined for no instruments or no customer data', () => {
      expect(recordSuccess({}, customer)).toBeUndefined();
      const instrument = {
        frequency: 9,
        id: 'KjscHbhxbaguXc',
        success: false,
        timestamp: 1670569101245,
        '_[flow]': 'directpay',
        method: 'upi',
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00@oksbi',
      };
      expect(recordSuccess(instrument, {})).toBeUndefined();
    });
  });
  describe('Tests for hasAnyInstrumentsOnDevice under index.js', () => {
    it('should return true for some saved instruments on the device', () => {
      const instruments = {
        b5604f31: [
          {
            frequency: 2,
            id: 'KjmhMqjQ3akgU7',
            success: false,
            timestamp: 1669273040119,
            method: 'card',
            token_id: 'token_KGw40fGGndjddR',
            type: 'prepaid',
            issuer: 'STCB',
            network: 'Visa',
          },
        ],
      };
      (getAllInstruments as unknown as jest.Mock).mockReturnValue(instruments);
      expect(hasAnyInstrumentsOnDevice()).toEqual(true);
    });
    it('should return false for no saved instruments on device', () => {
      (getAllInstruments as unknown as jest.Mock).mockReturnValue({});
      expect(hasAnyInstrumentsOnDevice()).toEqual(false);
    });
  });
  describe('Tests for processInstrument under index.js', () => {
    it('should return undefined for invalid payment details', () => {
      (getCustomer as unknown as jest.Mock).mockReturnValue(customer);
      expect(processInstrument({}, {})).toBeUndefined();
    });
    it('should return correct instrument used for payment', () => {
      (getCustomer as unknown as jest.Mock).mockReturnValue(customer);
      const paymentDetails = {
        contact: '+918708857906',
        email: 'test@test.com',
        amount: 100,
        method: 'upi',
        token: 'HDgNLcP3NmtD52',
        '_[flow]': 'directpay',
      };
      const expectedReturnValue = {
        '_[flow]': 'directpay',
        frequency: 1,
        id: expect.anything(),
        method: 'upi',
        success: false,
        timestamp: expect.anything(),
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00@oksbi',
      };
      expect(processInstrument(paymentDetails, {})).toEqual(
        expectedReturnValue
      );
    });
  });
});
