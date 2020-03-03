import * as Options from 'configurability/options';

test('Module: configurability/options', t => {
  test('Options.translateExternal', t => {
    test('Translates external options properly', t => {
      let options, expected, found;

      options = {
        blocks: {
          gpay: {
            name: 'Pay via Google Pay',
            description: 'Make a payment using your Google Pay app',
            instruments: [
              {
                method: 'upi',
                apps: ['gpay'],
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
        exclude: [
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
            card_types: ['credit'],
          },
          {
            method: 'card',
            issuers: ['ICIC'],
            card_types: ['debit'],
          },
        ],
        settings: {
          methods: {
            upi: false,
          },
        },
        sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
      };

      expected = {
        blocks: [
          {
            code: 'block.gpay',
            type: 'block',
            instruments: [
              {
                method: 'upi',
                apps: ['gpay'],
                type: 'instrument',
              },
            ],
            title: 'Pay via Google Pay',
          },
          {
            code: 'block.hdfc',
            type: 'block',
            instruments: [
              {
                method: 'card',
                issuers: ['HDFC'],
                type: 'instrument',
              },
              {
                method: 'netbanking',
                banks: ['HDFC'],
                type: 'instrument',
              },
              {
                method: 'wallet',
                wallets: ['payzapp'],
                type: 'instrument',
              },
            ],
            title: 'Pay via HDFC Bank',
          },
        ],
        exclude: {
          instruments: [
            {
              method: 'wallet',
              wallets: ['olamoney'],
              type: 'instrument',
            },
            {
              method: 'card',
              issuers: ['SBIN'],
              networks: ['mastercard'],
              type: 'instrument',
            },
            {
              method: 'card',
              card_types: ['credit'],
              type: 'instrument',
            },
            {
              method: 'card',
              issuers: ['ICIC'],
              card_types: ['debit'],
              type: 'instrument',
            },
          ],
          methods: [],
        },
      };

      found = Options.translateExternal(options);

      t.deepEqual(found, expected, 'Translates external options properly');

      t.end();
    });

    t.end();
  });

  t.end();
});
