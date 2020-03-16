import * as Ungroup from 'configurability/ungroup';

/**
 * TODO: Tests for card, upi.
 */

test('Module: configurability/ungroup', t => {
  test('Ungroup.ungroupInstruments', t => {
    test('method=netbanking', t => {
      let block, expected, found;
      let individualInstrument, groupedInstrument;

      individualInstrument = {
        method: 'netbanking',
        banks: ['HDFC'],
      };

      block = {
        code: 'block.test',
        instruments: [individualInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [individualInstrument],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Leaves individual instruments untouched');

      groupedInstrument = {
        method: 'netbanking',
        banks: ['HDFC', 'ICIC'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'netbanking',
            bank: 'HDFC',
          },
          {
            method: 'netbanking',
            bank: 'ICIC',
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=wallet', t => {
      let block, expected, found;
      let individualInstrument, groupedInstrument;

      individualInstrument = {
        method: 'wallet',
        wallets: ['freecharge'],
      };

      block = {
        code: 'block.test',
        instruments: [individualInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [individualInstrument],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Leaves individual instruments untouched');

      groupedInstrument = {
        method: 'wallet',
        wallets: ['freecharge', 'olamoney'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'wallet',
            wallet: 'freecharge',
          },
          {
            method: 'wallet',
            wallet: 'olamoney',
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=paypal', t => {
      let block, expected, found;
      let instrument;

      instrument = {
        method: 'paypal',
      };

      block = {
        code: 'block.test',
        instruments: [instrument],
      };

      expected = {
        code: 'block.test',
        instruments: [instrument],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Sends the same instrument back');

      t.end();
    });

    t.end();
  });

  t.end();
});
