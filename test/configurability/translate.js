import * as Translate from 'configurability/translate';

test('Module: configurability/translate', t => {
  test('Translate.translateExternal', t => {
    test('Translates external options properly', t => {
      let config, expected, found;

      config = {
        display: {
          blocks: {
            gpay: {
              name: 'Pay via Google Pay',
              description: 'Make a payment using your Google Pay app',
              instruments: [
                {
                  method: 'upi',
                  apps: ['googlepay'],
                },
              ],
            },
            hdfc: {
              name: 'Pay via HDFC Bank',
              description: 'Make the paymnet using your HDFC account',
              instruments: [
                {
                  method: 'card',
                  issuers: ['HDFC'],
                },
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
                {
                  method: 'wallet',
                  wallets: ['payzapp'],
                },
              ],
            },
          },
          hide: [
            {
              method: 'wallet',
              wallets: ['olamoney'],
            },
            {
              method: 'card',
              issuers: ['SBIN'],
              networks: ['mastercard'],
            },
            {
              method: 'card',
              types: ['credit'],
            },
            {
              method: 'card',
              issuers: ['ICIC'],
              types: ['debit'],
            },
          ],
          sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
        },
      };

      expected = {
        display: {
          blocks: [
            {
              code: 'block.gpay',
              _type: 'block',
              instruments: [
                {
                  method: 'upi',
                  apps: ['com.google.android.apps.nbu.paisa.user'],
                  _type: 'instrument',
                },
              ],
              title: 'Pay via Google Pay',
            },
            {
              code: 'block.hdfc',
              _type: 'block',
              instruments: [
                {
                  method: 'card',
                  issuers: ['HDFC'],
                  _type: 'instrument',
                },
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                  _type: 'instrument',
                },
                {
                  method: 'wallet',
                  wallets: ['payzapp'],
                  _type: 'instrument',
                },
              ],
              title: 'Pay via HDFC Bank',
            },
          ],
          hide: {
            instruments: [
              {
                method: 'wallet',
                wallets: ['olamoney'],
                _type: 'instrument',
              },
              {
                method: 'card',
                issuers: ['SBIN'],
                networks: ['mastercard'],
                _type: 'instrument',
              },
              {
                method: 'card',
                types: ['credit'],
                _type: 'instrument',
              },
              {
                method: 'card',
                issuers: ['ICIC'],
                types: ['debit'],
                _type: 'instrument',
              },
            ],
            methods: [],
          },
          sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
          preferences: {},
        },

        restrictions: {
          allow: {
            code: 'rzp.restricted',
            _type: 'block',
            instruments: [],
            title: 'Some payment methods',
          },
        },
      };

      found = Translate.translateExternal(config);

      t.deepEqual(found, expected, 'Translates external options properly');

      t.end();
    });

    t.end();
  });

  t.end();
});
