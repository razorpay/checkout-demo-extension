import * as Instruments from 'configurability/instruments';

test('Module: configurability/instruments', t => {
  test('Instruments.createInstrument', t => {
    test('Fails to create an instrument without a method', t => {
      let config, expected, found;

      config = {
        card_types: ['credit'],
      };

      found = Instruments.createInstrument(config);

      t.notOk(
        found,
        expected,
        'Fails to create an instrument without a method'
      );

      t.end();
    });

    test('Creates instrument of type=instrument with instrument keys', t => {
      let config, expected, found;

      config = {
        card_types: ['credit'],
        method: 'card',
      };

      expected = {
        card_types: ['credit'],
        method: 'card',
        type: 'instrument',
      };

      found = Instruments.createInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=instrument with instrument keys'
      );

      t.end();
    });

    test('Creates instrument of type=method without instrument keys', t => {
      let config, expected, found;

      config = {
        method: 'netbanking',
      };

      expected = {
        method: 'netbanking',
        type: 'method',
      };

      found = Instruments.createInstrument(config);

      t.deepEqual(
        found,
        expected,
        'Creates instrument of type=method without instrument keys'
      );

      t.end();
    });

    t.end();
  });

  test('Instruments.isInstrumentForEntireMethod', t => {
    test('Identifies instrument with keys as not a method instrument', t => {
      let instrument, found;

      instrument = {
        card_types: ['credit'],
        method: 'card',
      };

      found = Instruments.isInstrumentForEntireMethod(instrument);

      t.false(
        found,
        'Identifies instrument with keys as not a method instrument'
      );

      t.end();
    });

    test('Identifies instrument without keys as a method instrument', t => {
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
