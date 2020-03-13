import { translateInstrumentToConfig } from 'checkoutframe/personalization/translation';

test('Module: personalization', t => {
  test('translateInstrumentToConfig', t => {
    test('translates UPI collect instrument correctly', t => {
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
      t.equals(actual.flow, 'collect', 'Returns correct flow');
      t.equals(actual.vpa, 'success@razorpay', 'Returns correct VPA');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates UPI intent instrument correctly', t => {
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
      t.equals(actual.app, 'in.org.npci.upiapp', 'Returns correct app');
      t.equals(actual.flow, 'intent', 'Returns correct flow');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates UPI QR instrument correctly', t => {
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
      t.equals(actual.flow, 'qr', 'Returns correct flow');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates Card instrument correctly', t => {
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
      t.equals(actual.issuer, 'ICIC', 'Returns correct issuer');
      t.equals(actual.network, 'visa', 'Returns correct network');
      t.equals(
        actual.token_id,
        'token_9AT28Pxxe0Npi9',
        'Returns correct token id'
      );
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates Wallet instrument correctly', t => {
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
      t.equals(actual.wallet, 'freecharge', 'Returns correct wallet');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('translates netbanking instrument correctly', t => {
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
      t.equals(actual.bank, 'HDFC', 'Returns correct bank');
      t.ok(actual.meta, 'Meta is present');
      t.ok(actual.meta.preferred, 'meta.preferred is truthy');
      t.end();
    });

    test('returns undefined for empty instrument', t => {
      const instrument = {};

      const actual = translateInstrumentToConfig(instrument);

      t.equals(typeof actual, 'undefined', 'Returns undefined');
      t.end();
    });

    test('returns undefined for undefined instrument', t => {
      const instrument = undefined;

      const actual = translateInstrumentToConfig(instrument);

      t.equals(typeof actual, 'undefined', 'Returns undefined');
      t.end();
    });

    t.end();
  });
  t.end();
});
