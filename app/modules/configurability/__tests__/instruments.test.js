import * as Instruments from 'configurability/instruments';

describe('Module: configurability/instruments', () => {
  describe('Instruments.createInstrument', () => {
    test('Fails to create an instrument without a method', () => {
      let config, found;

      config = {
        types: ['credit'],
      };

      found = Instruments.createInstrument(config);

      expect(found).toBeUndefined();
    });

    test('Creates instrument of type=instrument with instrument keys', () => {
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

      expect(found).toEqual(expected);
    });

    test('Creates instrument of type=method without instrument keys', () => {
      let config, expected, found;

      config = {
        method: 'netbanking',
      };

      expected = {
        method: 'netbanking',
        _type: 'method',
      };

      found = Instruments.createInstrument(config);

      expect(found).toEqual(expected);
    });

    test('Transforms UPI app name', () => {
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

      expect(found).toEqual(expected);
    });
  });

  describe('Instruments.validateKeysAndCreateInstrument', () => {
    test('Fails to create an instrument without a method', () => {
      let config, found;

      config = {
        types: ['credit'],
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      expect(found).toBeUndefined();
    });

    test('Creates instrument of type=instrument with instrument keys', () => {
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

      expect(found).toEqual(expected);
    });

    test('Creates instrument of type=method without instrument keys', () => {
      let config, expected, found;

      config = {
        method: 'netbanking',
      };

      expected = {
        method: 'netbanking',
        _type: 'method',
      };

      found = Instruments.validateKeysAndCreateInstrument(config);

      expect(found).toEqual(expected);
    });

    test('Transforms UPI app name', () => {
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

      expect(found).toEqual(expected);
    });

    test('Fails to create instrument for unexpected keys', () => {
      let config, expected, found;

      config = {
        method: 'upi',
        flow: ['intent'],
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = undefined;

      found = Instruments.validateKeysAndCreateInstrument(config);

      expect(found).toEqual(expected);
    });

    test('Fails to create instrument for expected keys as non-array', () => {
      let config, expected, found;

      config = {
        method: 'upi',
        flows: 'intent',
        apps: ['google_pay', 'com.somerandom.app'],
      };

      expected = undefined;

      found = Instruments.validateKeysAndCreateInstrument(config);

      expect(found).toEqual(expected);
    });
  });

  describe('Instruments.isInstrumentForEntireMethod', () => {
    test('Identifies instrument with keys as not a method instrument', () => {
      let instrument, found;

      instrument = {
        types: ['credit'],
        method: 'card',
      };

      found = Instruments.isInstrumentForEntireMethod(instrument);

      expect(found).toBe(false);
    });

    test('Identifies instrument without keys as a method instrument', () => {
      let instrument, found;

      instrument = {
        method: 'netbanking',
      };

      found = Instruments.isInstrumentForEntireMethod(instrument);

      expect(found).toBe(true);
    });
  });
});
