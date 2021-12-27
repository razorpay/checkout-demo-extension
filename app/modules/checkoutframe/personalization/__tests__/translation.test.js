import { translateInstrumentToConfig } from 'checkoutframe/personalization/translation';
import { transformInstrumentToStorageFormat } from 'checkoutframe/personalization/api';

describe('Module: personalization', () => {
  describe('translateInstrumentToConfig', () => {
    test('translates UPI collect instrument correctly', () => {
      const instrument = {
        frequency: 1,
        id: 'EOZESgq122HsIH',
        success: false,
        timestamp: 1583417852181,
        '_[flow]': 'directpay',
        vpa: 'success@razorpay',
        method: 'upi',
        score: 0.3449507176395772,
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'EOZESgq122HsIH',
        method: 'upi',
        flows: ['collect'],
        vpas: ['success@razorpay'],
        meta: {
          preferred: true,
        },
      });
    });

    test('translates UPI intent instrument correctly', () => {
      const instrument = {
        frequency: 1,
        id: 'EOZESgq122HsIH',
        success: false,
        timestamp: 1583417852181,
        '_[flow]': 'intent',
        upi_app: 'in.org.npci.upiapp',
        method: 'upi',
        score: 0.3449507176395772,
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'EOZESgq122HsIH',
        method: 'upi',
        apps: ['in.org.npci.upiapp'],
        flows: ['intent'],
        meta: {
          preferred: true,
        },
      });
    });

    test('translates UPI QR instrument correctly', () => {
      const instrument = {
        frequency: 1,
        id: 'EOZESgq122HsIH',
        success: false,
        timestamp: 1583417852181,
        '_[flow]': 'intent',
        '_[upiqr]': 1,
        method: 'upi',
        score: 0.3449507176395772,
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'EOZESgq122HsIH',
        method: 'upi',
        flows: ['qr'],
        meta: {
          preferred: true,
        },
      });
    });

    test('translates Card instrument correctly', () => {
      const instrument = {
        method: 'card',
        token_id: 'token_9AT28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'Visa',
        timestamp: 1574056926308,
        success: true,
        frequency: 1,
        id: 'Dhh671dR688OWQ',
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'Dhh671dR688OWQ',
        method: 'card',
        issuers: ['ICIC'],
        networks: ['Visa'],
        types: ['credit'],
        token_id: 'token_9AT28Pxxe0Npi9',
        meta: {
          preferred: true,
        },
      });
    });

    test('translates Wallet instrument correctly', () => {
      const instrument = {
        wallet: 'freecharge',
        method: 'wallet',
        timestamp: 1574081911355,
        success: true,
        frequency: 1,
        id: 'DhoBzK59KicZni',
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'DhoBzK59KicZni',
        method: 'wallet',
        wallets: ['freecharge'],
        meta: {
          preferred: true,
        },
      });
    });

    test('translates netbanking instrument correctly', () => {
      const instrument = {
        bank: 'HDFC',
        method: 'netbanking',
        timestamp: 1574062745851,
        success: true,
        frequency: 2,
        id: 'Dhh86QTueOpyWX',
      };

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toEqual({
        id: 'Dhh86QTueOpyWX',
        method: 'netbanking',
        banks: ['HDFC'],
        meta: {
          preferred: true,
        },
      });
    });

    test('returns undefined for empty instrument', () => {
      const instrument = {};

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toBeUndefined();
    });

    test('returns undefined for undefined instrument', () => {
      const instrument = undefined;

      const actual = translateInstrumentToConfig(instrument);

      expect(actual).toBeUndefined();
    });
  });
  describe('translate api instruments to their storage equivalent', () => {
    test('transforms a wallet instrument correctly', () => {
      const instrument = {
        method: 'wallet',
        instrument: 'payzapp',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      expect(actual).toEqual({
        method: 'wallet',
        wallet: 'payzapp',
        score: 1,
      });
    });

    test('transforms a netbanking instrument correctly', () => {
      const instrument = {
        method: 'netbanking',
        instrument: 'KKBK',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      expect(actual).toEqual({
        method: 'netbanking',
        bank: 'KKBK',
        score: 1,
      });
    });

    test('transforms a upi intent instrument correctly', () => {
      const instrument = {
        method: 'upi',
        instrument: '@ybl',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      expect(actual).toEqual({
        method: 'upi',
        '_[flow]': 'intent',
        upi_app: 'com.phonepe.app',
        score: 1,
        vendor_vpa: '@ybl',
        vpa: '@ybl',
      });
    });

    test('transforms a upi collect instrument correctly', () => {
      const instrument = {
        method: 'upi',
        instrument: 'saranshgupta1995@ybl',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      expect(actual).toEqual({
        method: 'upi',
        '_[flow]': 'directpay',
        score: 1,
        vpa: 'saranshgupta1995@ybl',
      });
    });

    test('transforms a card collect instrument correctly', () => {
      const instrument = {
        method: 'card',
        issuer: 'UTIB',
        network: 'MasterCard',
        type: 'debit',
        instrument: 'F1lKrOrLTkTpyJ',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      expect(actual).toEqual({
        method: 'card',
        issuer: 'UTIB',
        network: 'MasterCard',
        type: 'debit',
        token_id: 'F1lKrOrLTkTpyJ',
        score: 1,
      });
    });
  });
});
