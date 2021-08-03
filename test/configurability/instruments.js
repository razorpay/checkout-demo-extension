import * as Instruments from 'configurability/instruments';

test('Module: configurability/instruments', (t) => {
  test('Instruments.createInstrument', (t) => {
    test('Fails to create an instrument without a method', (t) => {
      let config, expected, found;

      config = {
        types: ['credit'],
      };

      found = Instruments.createInstrument(config);

      t.notOk(
        found,
        expected,
        'Fails to create an instrument without a method'
      );

      t.end();
    });

    test('Creates instrument of type=instrument with instrument keys', (t) => {
      let config, expected, found;

      config = {
        types: ['credit'],
        method: 'card',
      };

      expected = {
        types: ['credit'],
        method: 'card',
        _type: 'instrument',
      };

      found = Instruments.createInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=instrument with instrument keys'
      );

      t.end();
    });

    test('Creates instrument of type=method without instrument keys', (t) => {
      let config, expected, found;

      config = {
        method: 'netbanking',
      };

      expected = {
        method: 'netbanking',
        _type: 'method',
      };

      found = Instruments.createInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=method without instrument keys'
      );

      t.end();
    });

    test('Transforms UPI app name', (t) => {
      let config, expected, found;

      config = {
        method: 'upi',
        flows: ['intent'],
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = {
        method: 'upi',
        flows: ['intent'],
        apps: ['com.google.android.apps.nbu.paisa.user', 'com.somerandom.app'],
        _type: 'instrument',
      };

      found = Instruments.createInstrument(config);

      t.deepEqual(found, expected, 'Transforms UPI app name');

      t.end();
    });

    t.end();
  });

  test('Instruments.validateKeysAndCreateInstrument', (t) => {
    test('Fails to create an instrument without a method', (t) => {
      let config, expected, found;

      config = {
        types: ['credit'],
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.notOk(
        found,
        expected,
        'Fails to create an instrument without a method'
      );

      t.end();
    });

    test('Creates instrument of type=instrument with instrument keys', (t) => {
      let config, expected, found;

      config = {
        types: ['credit'],
        method: 'card',
      };

      expected = {
        types: ['credit'],
        method: 'card',
        _type: 'instrument',
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=instrument with instrument keys'
      );

      t.end();
    });

    test('Creates instrument of type=method without instrument keys', (t) => {
      let config, expected, found;

      config = {
        method: 'netbanking',
      };

      expected = {
        method: 'netbanking',
        _type: 'method',
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=method without instrument keys'
      );

      t.end();
    });

    test('Transforms UPI app name', (t) => {
      let config, expected, found;

      config = {
        method: 'upi',
        flows: ['intent'],
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = {
        method: 'upi',
        flows: ['intent'],
        apps: ['com.google.android.apps.nbu.paisa.user', 'com.somerandom.app'],
        _type: 'instrument',
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.deepEqual(found, expected, 'Transforms UPI app name');

      t.end();
    });

    test('Fails to create instrument for unexpected keys', (t) => {
      let config, expected, found;

      config = {
        method: 'upi',
        flow: ['intent'],
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = undefined;

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.deepEqual(found, expected, 'Does not create instrument');

      t.end();
    });

    test('Fails to create instrument for expected keys as non-array', (t) => {
      let config, expected, found;

      config = {
        method: 'upi',
        flows: 'intent',
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = undefined;

      found = Instruments.validateKeysAndCreateInstrument(config);

      t.deepEqual(found, expected, 'Does not create instrument');

      t.end();
    });

    t.end();
  });

  test('Instruments.isInstrumentForEntireMethod', (t) => {
    test('Identifies instrument with keys as not a method instrument', (t) => {
      let instrument, found;

      instrument = {
        types: ['credit'],
        method: 'card',
      };

      found = Instruments.isInstrumentForEntireMethod(instrument);

      t.false(
        found,
        'Identifies instrument with keys as not a method instrument'
      );

      t.end();
    });

    test('Identifies instrument without keys as a method instrument', (t) => {
      let instrument, found;

      instrument = {
        method: 'netbanking',
      };

      found = Instruments.isInstrumentForEntireMethod(instrument);

      t.true(
        found,
        'Identifies instrument without keys as a method instrument'
      );

      t.end();
    });

    t.end();
  });

  t.end();
});
