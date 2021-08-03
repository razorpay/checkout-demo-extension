import { translateInstrumentToConfig } from 'checkoutframe/personalization/translation';
import { transformInstrumentToStorageFormat } from 'checkoutframe/personalization/api';

test('Module: personalization', (t) => {
  test('translateInstrumentToConfig', (t) => {
    test('translates UPI collect instrument correctly', (t) => {
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

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'EOZESgq122HsIH', 'Returns correct id');
      t.equals(actual.method, 'upi', 'Returns correct method');
      t.deepEqual(actual.flows, ['collect'], 'Returns correct flows');
      t.deepEqual(actual.vpas, ['success@razorpay'], 'Returns correct VPAs');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates UPI intent instrument correctly', (t) => {
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

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'EOZESgq122HsIH', 'Returns correct id');
      t.equals(actual.method, 'upi', 'Returns correct method');
      t.deepEqual(actual.apps, ['in.org.npci.upiapp'], 'Returns correct apps');
      t.deepEqual(actual.flows, ['intent'], 'Returns correct flows');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates UPI QR instrument correctly', (t) => {
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

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'EOZESgq122HsIH', 'Returns correct id');
      t.equals(actual.method, 'upi', 'Returns correct method');
      t.deepEqual(actual.flows, ['qr'], 'Returns correct flows');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates Card instrument correctly', (t) => {
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

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'Dhh671dR688OWQ', 'Returns correct id');
      t.equals(actual.method, 'card', 'Returns correct method');
      t.deepEqual(actual.issuers, ['ICIC'], 'Returns correct issuers');
      t.deepEqual(actual.networks, ['Visa'], 'Returns correct networks');
      t.equals(
        actual.token_id,
        'token_9AT28Pxxe0Npi9',
        'Returns correct token id'
      );
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates Wallet instrument correctly', (t) => {
      const instrument = {
        wallet: 'freecharge',
        method: 'wallet',
        timestamp: 1574081911355,
        success: true,
        frequency: 1,
        id: 'DhoBzK59KicZni',
      };

      const actual = translateInstrumentToConfig(instrument);

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'DhoBzK59KicZni', 'Returns correct id');
      t.equals(actual.method, 'wallet', 'Returns correct method');
      t.deepEqual(actual.wallets, ['freecharge'], 'Returns correct wallets');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates netbanking instrument correctly', (t) => {
      const instrument = {
        bank: 'HDFC',
        method: 'netbanking',
        timestamp: 1574062745851,
        success: true,
        frequency: 2,
        id: 'Dhh86QTueOpyWX',
      };

      const actual = translateInstrumentToConfig(instrument);

      t.ok(actual, 'Returns a truthy value');
      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.id, 'Dhh86QTueOpyWX', 'Returns correct id');
      t.equals(actual.method, 'netbanking', 'Returns correct method');
      t.deepEqual(actual.banks, ['HDFC'], 'Returns correct banks');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('returns undefined for empty instrument', (t) => {
      const instrument = {};

      const actual = translateInstrumentToConfig(instrument);

      t.equals(typeof actual, 'undefined', 'Returns undefined');
      t.end();
    });

    test('returns undefined for undefined instrument', (t) => {
      const instrument = undefined;

      const actual = translateInstrumentToConfig(instrument);

      t.equals(typeof actual, 'undefined', 'Returns undefined');
      t.end();
    });

    t.end();
  });
  test('translate api instruments to their storage equivalent', (t) => {
    test('transforms a wallet instrument correctly', (t) => {
      const instrument = {
        method: 'wallet',
        instrument: 'payzapp',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.method, 'wallet', 'Returns the correct method');
      t.equals(actual.score, 1, 'Returns the correct score');
      t.equals(actual.wallet, 'payzapp', 'Returns the correct wallet');
      t.equals(
        typeof actual.instrument,
        'undefined',
        'Prevents duplicate data'
      );

      t.end();
    });
    test('transforms a netbanking instrument correctly', (t) => {
      const instrument = {
        method: 'netbanking',
        instrument: 'KKBK',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.method, 'netbanking', 'Returns the correct method');
      t.equals(actual.score, 1, 'Returns the correct score');
      t.equals(actual.bank, 'KKBK', 'Returns the correct bank');
      t.equals(
        typeof actual.instrument,
        'undefined',
        'Prevents duplicate data'
      );

      t.end();
    });
    test('transforms a upi intent instrument correctly', (t) => {
      const instrument = {
        method: 'upi',
        instrument: '@ybl',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.method, 'upi', 'Returns the correct method');
      t.equals(actual.score, 1, 'Returns the correct score');
      t.equals(actual['_[flow]'], 'intent', 'Returns the correct flow');
      t.equals(actual['upi_app'], 'com.phonepe.app', 'Returns the correct app');

      t.end();
    });
    test('transforms a upi collect instrument correctly', (t) => {
      const instrument = {
        method: 'upi',
        instrument: 'saranshgupta1995@ybl',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.method, 'upi', 'Returns the correct method');
      t.equals(actual.score, 1, 'Returns the correct score');
      t.equals(actual.vpa, 'saranshgupta1995@ybl', 'Returns the correct vpa');
      t.equals(actual['_[flow]'], 'directpay', 'Returns the correct flow');

      t.equals(
        typeof actual.instrument,
        'undefined',
        'Prevents duplicate data'
      );

      t.end();
    });
    test('transforms a card collect instrument correctly', (t) => {
      const instrument = {
        method: 'card',
        issuer: 'UTIB',
        network: 'MasterCard',
        type: 'debit',
        instrument: 'F1lKrOrLTkTpyJ',
        score: 1,
      };

      const actual = transformInstrumentToStorageFormat(instrument);

      t.equals(typeof actual, 'object', 'Returns an object');
      t.equals(actual.method, 'card', 'Returns the correct method');
      t.equals(actual.score, 1, 'Returns the correct score');
      t.equals(actual.issuer, 'UTIB', 'Returns the correct issuer');
      t.equals(actual.network, 'MasterCard', 'Returns the correct network');
      t.equals(actual.type, 'debit', 'Returns the correct type');
      t.equals(
        actual.token_id,
        'F1lKrOrLTkTpyJ',
        'Returns the correct identifier'
      );

      t.equals(
        typeof actual.instrument,
        'undefined',
        'Prevents duplicate data'
      );

      t.end();
    });

    t.end();
  });
  t.end();
});
