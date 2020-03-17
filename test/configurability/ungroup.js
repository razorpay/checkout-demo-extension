import * as Ungroup from 'configurability/ungroup';

/**
 * TODO: Tests for card, upi.
 */

test('Module: configurability/ungroup', t => {
  test('Ungroup.ungroupInstruments', t => {
    test('method=card', t => {
      let block, expected, found;
      let individualInstrument, groupedInstrument;
      let customer = {
        tokens: {
          items: [
            {
              id: 'token_12345',
              entity: 'token',
              token: 'abcdefgh',
              bank: null,
              wallet: null,
              method: 'card',
              card: {
                entity: 'card',
                name: 'Umang Galaiya',
                last4: '1234',
                network: 'Visa',
                type: 'credit',
                issuer: 'HDFC',
                international: false,
                emi: true,
                expiry_month: 12,
                expiry_year: 2024,
                flows: {
                  otp: true,
                  recurring: true,
                  iframe: false,
                },
              },
              vpa: null,
              recurring: true,
              auth_type: null,
              mrn: null,
              used_at: 1584039592,
              created_at: 1574414210,
              expired_at: 1669832999,
            },

            {
              id: 'token_54321',
              entity: 'token',
              token: 'abcdefgh',
              bank: null,
              wallet: null,
              method: 'card',
              card: {
                entity: 'card',
                name: 'Umang Galaiya',
                last4: '4321',
                network: 'MasterCard',
                type: 'debit',
                issuer: 'ICIC',
                international: false,
                emi: true,
                expiry_month: 12,
                expiry_year: 2024,
                flows: {
                  otp: true,
                  recurring: true,
                  iframe: false,
                },
              },
              vpa: null,
              recurring: true,
              auth_type: null,
              mrn: null,
              used_at: 1584039592,
              created_at: 1574414210,
              expired_at: 1669832999,
            },
          ],
        },
      };

      individualInstrument = {
        method: 'card',
        token_id: 'token_12345',
      };

      block = {
        code: 'block.test',
        instruments: [individualInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'card',
            token_id: 'token_12345',
            card_type: 'credit',
            issuer: 'HDFC',
            network: 'visa',
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(found, expected, 'Works for token_id');

      groupedInstrument = {
        method: 'card',
        token_ids: ['token_12345', 'token_54321'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'card',
            token_id: 'token_12345',
            card_type: 'credit',
            issuer: 'HDFC',
            network: 'visa',
          },
          {
            method: 'card',
            token_id: 'token_54321',
            card_type: 'debit',
            issuer: 'ICIC',
            network: 'mastercard',
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(found, expected, 'Works for token_ids');

      groupedInstrument = {
        method: 'card',
        card_networks: ['visa'],
        issuers: ['HDFC', 'ICIC'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(
        found,
        expected,
        'Leaves instruments without token_id or token_ids untouched'
      );

      block = {
        code: 'block.test',
        instruments: [
          {
            method: 'card',
            token_ids: ['token_12345', 'token_54321'],
          },
          {
            method: 'card',
            card_networks: ['visa'],
            issuers: ['HDFC', 'ICIC'],
          },
        ],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'card',
            token_id: 'token_12345',
            card_type: 'credit',
            issuer: 'HDFC',
            network: 'visa',
          },
          {
            method: 'card',
            token_id: 'token_54321',
            card_type: 'debit',
            issuer: 'ICIC',
            network: 'mastercard',
          },
          {
            method: 'card',
            card_networks: ['visa'],
            issuers: ['HDFC', 'ICIC'],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(
        found,
        expected,
        'Works on a mix of instruments with and without token_id(s)'
      );

      t.end();
    });

    test('method=netbanking', t => {
      let block, expected, found;
      let individualInstrument, groupedInstrument;

      individualInstrument = {
        method: 'netbanking',
        bank: 'HDFC',
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
        wallet: 'freecharge',
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

    test('method=cardless_emi', t => {
      let block, expected, found;
      let individualInstrument, groupedInstrument;

      individualInstrument = {
        method: 'cardless_emi',
        provider: 'zestmoney',
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
        method: 'cardless_emi',
        providers: ['zestmoney', 'earlysalary'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'cardless_emi',
            provider: 'zestmoney',
          },
          {
            method: 'cardless_emi',
            provider: 'earlysalary',
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

    test('method=bank_transfer', t => {
      let block, expected, found;
      let instrument;

      instrument = {
        method: 'bank_transfer',
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
