import * as Instruments from 'configurability/instruments';

test('Module: configurability/instruments', t => {
  test('Instruments.createInstrument', t => {
    let config;
    let expected;
    let found;

    config = {
      card_types: ['credit'],
    };

    found = Instruments.createInstrument(config);

    t.notOk(found, expected, 'Fails to create an instrument without a method');

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

  test('Instruments.isInstrumentForEntireMethod', t => {
    let instrument;
    let found;

    instrument = {
      card_types: ['credit'],
      method: 'card',
    };

    found = Instruments.isInstrumentForEntireMethod(instrument);

    t.false(
      found,
      'Identifies instrument with keys as not a method instrument'
    );

    instrument = {
      method: 'netbanking',
    };

    found = Instruments.isInstrumentForEntireMethod(instrument);

    t.true(found, 'Identifies instrument without keys as a method instrument');

    t.end();
  });

  t.end();
});
