import * as Ungroup from 'configurability/ungroup';

test('Module: configurability/ungroup', (t) => {
  test('Ungroup.ungroupInstruments', (t) => {
    test('method=card', (t) => {
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
            _ungrouped: [
              {
                method: 'card',
                token_id: 'token_12345',
                type: 'credit',
                issuer: 'HDFC',
                network: 'Visa',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(found, expected, 'Works for token_id');

      groupedInstrument = {
        method: 'card',
        networks: ['Visa'],
        issuers: ['HDFC', 'ICIC'],
      };

      block = {
        code: 'block.test',
        instruments: [
          {
            method: 'card',
            types: ['credit'],
          },
          {
            method: 'card',
            networks: ['Visa', 'RuPay'],
          },
          {
            method: 'card',
            issuers: ['HDFC', 'ICIC'],
          },
          {
            method: 'card',
            types: ['credit'],
            networks: ['Visa', 'RuPay'],
          },
          {
            method: 'card',
            types: ['credit'],
            issuers: ['HDFC', 'ICIC'],
          },
          {
            method: 'card',
            networks: ['Visa', 'RuPay'],
            issuers: ['HDFC', 'ICIC'],
          },
          {
            method: 'card',
            types: ['credit'],
            networks: ['Visa', 'RuPay'],
            issuers: ['HDFC', 'ICIC'],
          },
        ],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            _ungrouped: [
              {
                type: 'credit',
                method: 'card',
              },
            ],
            method: 'card',
            types: ['credit'],
          },
          {
            _ungrouped: [
              {
                network: 'Visa',
                method: 'card',
              },
              {
                network: 'RuPay',
                method: 'card',
              },
            ],
            method: 'card',
            networks: ['Visa', 'RuPay'],
          },
          {
            _ungrouped: [
              {
                issuer: 'HDFC',
                method: 'card',
              },
              {
                issuer: 'ICIC',
                method: 'card',
              },
            ],
            method: 'card',
            issuers: ['HDFC', 'ICIC'],
          },
          {
            _ungrouped: [
              {
                type: 'credit',
                network: 'Visa',
                method: 'card',
              },
              {
                type: 'credit',
                network: 'RuPay',
                method: 'card',
              },
            ],
            method: 'card',
            types: ['credit'],
            networks: ['Visa', 'RuPay'],
          },
          {
            _ungrouped: [
              {
                type: 'credit',
                issuer: 'HDFC',
                method: 'card',
              },
              {
                type: 'credit',
                issuer: 'ICIC',
                method: 'card',
              },
            ],
            method: 'card',
            types: ['credit'],
            issuers: ['HDFC', 'ICIC'],
          },
          {
            _ungrouped: [
              {
                network: 'Visa',
                issuer: 'HDFC',
                method: 'card',
              },
              {
                network: 'Visa',
                issuer: 'ICIC',
                method: 'card',
              },
              {
                network: 'RuPay',
                issuer: 'HDFC',
                method: 'card',
              },
              {
                network: 'RuPay',
                issuer: 'ICIC',
                method: 'card',
              },
            ],
            method: 'card',
            networks: ['Visa', 'RuPay'],
            issuers: ['HDFC', 'ICIC'],
          },
          {
            _ungrouped: [
              {
                type: 'credit',
                network: 'Visa',
                issuer: 'HDFC',
                method: 'card',
              },
              {
                type: 'credit',
                network: 'Visa',
                issuer: 'ICIC',
                method: 'card',
              },
              {
                type: 'credit',
                network: 'RuPay',
                issuer: 'HDFC',
                method: 'card',
              },
              {
                type: 'credit',
                network: 'RuPay',
                issuer: 'ICIC',
                method: 'card',
              },
            ],
            method: 'card',
            types: ['credit'],
            networks: ['Visa', 'RuPay'],
            issuers: ['HDFC', 'ICIC'],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block, customer);

      t.deepEqual(
        found,
        expected,
        'Works on instruments with issuers, networks and types'
      );

      t.end();
    });

    test('method=netbanking', (t) => {
      let block, expected, found;
      let groupedInstrument;

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
            banks: ['HDFC', 'ICIC'],
            _ungrouped: [
              {
                method: 'netbanking',
                bank: 'HDFC',
              },
              {
                method: 'netbanking',
                bank: 'ICIC',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=upi', (t) => {
      let block, expected, found;
      let groupedInstrument;

      const customer = {
        tokens: {
          items: [
            {
              id: 'token_12345',
              entity: 'token',
              token: 'abcde',
              bank: null,
              wallet: null,
              method: 'upi',
              vpa: {
                username: 'test',
                handle: 'unit',
                name: null,
              },
              recurring: false,
              recurring_details: {
                status: 'not_applicable',
                failure_reason: null,
              },
              auth_type: null,
              mrn: null,
              used_at: 1582093612,
              created_at: 1580912391,
              start_time: null,
            },
            {
              id: 'token_54321',
              entity: 'token',
              token: 'pqrst',
              bank: null,
              wallet: null,
              method: 'upi',
              vpa: {
                username: 'anothertest',
                handle: 'unit',
                name: null,
              },
              recurring: false,
              recurring_details: {
                status: 'not_applicable',
                failure_reason: null,
              },
              auth_type: null,
              mrn: null,
              used_at: 1582093612,
              created_at: 1580912391,
              start_time: null,
            },
          ],
        },
      };

      groupedInstrument = {
        method: 'upi',
        flows: ['qr', 'collect'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'upi',
            flows: ['qr', 'collect'],
            _ungrouped: [
              {
                method: 'upi',
                flow: 'qr',
              },
              {
                method: 'upi',
                flow: 'collect',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Works for grouped instrument: flows');

      groupedInstrument = {
        method: 'upi',
        apps: ['com.google.android.apps.nbu.paisa.user', 'com.phonepe.app'],
        flows: ['intent'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'upi',
            apps: ['com.google.android.apps.nbu.paisa.user', 'com.phonepe.app'],
            flows: ['intent'],
            _ungrouped: [
              {
                method: 'upi',
                app: 'com.google.android.apps.nbu.paisa.user',
                flow: 'intent',
              },
              {
                method: 'upi',
                app: 'com.phonepe.app',
                flow: 'intent',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Works for grouped instrument: apps');

      groupedInstrument = {
        method: 'upi',
        apps: ['com.google.android.apps.nbu.paisa.user', 'com.phonepe.app'],
        flows: ['qr', 'collect', 'intent'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'upi',
            apps: ['com.google.android.apps.nbu.paisa.user', 'com.phonepe.app'],
            flows: ['qr', 'collect', 'intent'],
            _ungrouped: [
              {
                method: 'upi',
                app: 'com.google.android.apps.nbu.paisa.user',
                flow: 'intent',
              },
              {
                method: 'upi',
                app: 'com.phonepe.app',
                flow: 'intent',
              },
              {
                method: 'upi',
                flow: 'qr',
              },
              {
                method: 'upi',
                flow: 'collect',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(
        found,
        expected,
        'Works for grouped instrument with multiple keys: apps, flows'
      );

      t.end();
    });

    test('method=wallet', (t) => {
      let block, expected, found;
      let groupedInstrument;

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
            wallets: ['freecharge', 'olamoney'],
            _ungrouped: [
              {
                method: 'wallet',
                wallet: 'freecharge',
              },
              {
                method: 'wallet',
                wallet: 'olamoney',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=cardless_emi', (t) => {
      let block, expected, found;
      let groupedInstrument;

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
            providers: ['zestmoney', 'earlysalary'],
            _ungrouped: [
              {
                method: 'cardless_emi',
                provider: 'zestmoney',
              },
              {
                method: 'cardless_emi',
                provider: 'earlysalary',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=paylater', (t) => {
      let block, expected, found;
      let groupedInstrument;

      groupedInstrument = {
        method: 'paylater',
        providers: ['epaylater', 'getsimpl'],
      };

      block = {
        code: 'block.test',
        instruments: [groupedInstrument],
      };

      expected = {
        code: 'block.test',
        instruments: [
          {
            method: 'paylater',
            providers: ['epaylater', 'getsimpl'],
            _ungrouped: [
              {
                method: 'paylater',
                provider: 'epaylater',
              },
              {
                method: 'paylater',
                provider: 'getsimpl',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Ungroupes a grouped instrument');

      t.end();
    });

    test('method=paypal', (t) => {
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
        instruments: [
          {
            method: 'paypal',
            _ungrouped: [
              {
                method: 'paypal',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Sends the same instrument back');

      t.end();
    });

    test('method=bank_transfer', (t) => {
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
        instruments: [
          {
            method: 'bank_transfer',
            _ungrouped: [
              {
                method: 'bank_transfer',
              },
            ],
          },
        ],
      };

      found = Ungroup.ungroupInstruments(block);

      t.deepEqual(found, expected, 'Sends the same instrument back');

      t.end();
    });

    t.end();
  });

  t.end();
});
