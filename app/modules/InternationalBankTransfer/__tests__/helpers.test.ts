import { writable } from 'svelte/store';

// utils
import { setupPreferences } from 'tests/setupPreferences';
import fetch from 'utils/fetch';

// module
import {
  isIntlBankTransferEnabled,
  getAllMethods,
  getPreferredMethod,
  isIntlBankTransferMethod,
  getDetailsForIntlBankTransfer,
  getVAs,
} from '../helpers';

jest.mock('utils/fetch');

jest.mock('svelte-i18n', () => ({
  t: writable((arg: unknown) => arg),
  dictionary: writable({}),
  locale: writable('en-US'),
}));

describe('Test Intl Bank Transfer Helper Functions', () => {
  describe('Test isIntlBankTransferEnabled', () => {
    test('should return false', () => {
      expect(isIntlBankTransferEnabled()).toEqual(false);
    });
    test('should return true if USD currency is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_usd: 1,
            },
          },
        }
      );
      expect(isIntlBankTransferEnabled()).toEqual(true);
    });
    test('should return true if GBP currency is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_gbp: 1,
            },
          },
        }
      );
      expect(isIntlBankTransferEnabled()).toEqual(true);
    });
    test('should return true if CAD currency is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_cad: 1,
            },
          },
        }
      );
      expect(isIntlBankTransferEnabled()).toEqual(true);
    });
    test('should return true if EUR currency is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_eur: 1,
            },
          },
        }
      );
      expect(isIntlBankTransferEnabled()).toEqual(true);
    });
    test('should return false if other currency is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_kht: 1,
            },
          },
        }
      );
      expect(isIntlBankTransferEnabled()).toEqual(false);
    });
  });

  describe('Test getAllMethods', () => {
    test('should return false if intl_bank_transfer is disabled', () => {
      expect(getAllMethods()).toStrictEqual([]);
    });
    test('should return enabled methods if intl_bank_transfer is enabled', () => {
      setupPreferences(
        'loggedin',
        {},
        {
          methods: {
            intl_bank_transfer: {
              va_usd: 1,
              va_gbp: 1,
              va_eur: 1,
              va_cad: 1,
            },
          },
        }
      );
      expect(getAllMethods()).toStrictEqual([
        {
          id: 'va_usd',
        },
        {
          id: 'va_gbp',
        },
        {
          id: 'va_eur',
        },
        {
          id: 'va_cad',
        },
      ]);
    });
  });

  describe('Test getPreferredMethod', () => {
    test('should return null if instrument is undefined', () => {
      expect(getPreferredMethod(undefined)).toStrictEqual(null);
    });
    test('should return null if method is not intl_bank_transfer', () => {
      expect(
        getPreferredMethod({ method: 'bank_transfer', providers: [] })
      ).toStrictEqual(null);
    });
    test('should return null if method is intl_bank_transfer and providers is empty', () => {
      expect(
        getPreferredMethod({ method: 'bank_transfer', providers: [] })
      ).toStrictEqual(null);
    });
    test('should return null if method is intl_bank_transfer and providers is different', () => {
      expect(
        getPreferredMethod({ method: 'intl_bank_transfer', providers: ['upi'] })
      ).toStrictEqual(undefined);
    });
    test('should return va_usd if method is intl_bank_transfer', () => {
      expect(
        getPreferredMethod({
          method: 'intl_bank_transfer',
          providers: ['va_usd'],
        })
      ).toStrictEqual('va_usd');
    });
    test('should return first provider if method is intl_bank_transfer', () => {
      expect(
        getPreferredMethod({
          method: 'intl_bank_transfer',
          providers: ['va_usd', 'va_eur'],
        })
      ).toStrictEqual('va_usd');
    });
  });

  describe('Test isIntlBankTransferMethod', () => {
    test('should return false if instrument is undefined', () => {
      expect(isIntlBankTransferMethod(undefined)).toStrictEqual(false);
    });
    test('should return false if method is not intl_bank_transfer', () => {
      expect(
        isIntlBankTransferMethod({ method: 'bank_transfer', providers: [] })
      ).toStrictEqual(false);
    });
    test('should return false if method is intl_bank_transfer and providers is empty', () => {
      expect(
        isIntlBankTransferMethod({ method: 'bank_transfer', providers: [] })
      ).toStrictEqual(false);
    });
    test('should return false if method is intl_bank_transfer and providers is different', () => {
      expect(
        isIntlBankTransferMethod({
          method: 'bank_transfer',
          providers: ['upi'],
        })
      ).toStrictEqual(false);
    });
    test('should return va_usd if method is intl_bank_transfer', () => {
      expect(
        isIntlBankTransferMethod({
          method: 'intl_bank_transfer',
          providers: ['va_usd'],
        })
      ).toStrictEqual(true);
    });
    test('should return first provider if method is intl_bank_transfer', () => {
      expect(
        isIntlBankTransferMethod({
          method: 'intl_bank_transfer',
          providers: ['va_usd', 'va_eur'],
        })
      ).toStrictEqual(true);
    });
  });

  describe('Test getDetailsForIntlBankTransfer', () => {
    test('should return icon and title for the USD currency', () => {
      expect(
        getDetailsForIntlBankTransfer(
          { method: 'intl_bank_transfer', providers: ['va_usd'] },
          ''
        )
      ).toStrictEqual({
        icon: 'https://cdn.razorpay.com/international/us.png',
        subtitle: '',
        title:
          'intl_bank_transfer.va_usd.title - intl_bank_transfer.va_usd.subtitle',
      });
    });
  });

  describe('Test getVAs', () => {
    test('should make get api call to fetch virtual accounts', () => {
      getVAs({
        vaCurrency: 'USD',
        amount: 100,
        baseCurrency: 'INR',
      });

      expect(fetch).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.razorpay.com/v1/international/virtual_account/USD?amount=100&currency=INR',
        })
      );
    });
  });
});
