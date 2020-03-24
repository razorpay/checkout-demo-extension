import * as Translate from 'configurability/translate';

test('Module: configurability/translate', t => {
  test('Translate.translateExternal', t => {
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
            _type: 'block',
            instruments: [
              {
                method: 'upi',
                apps: ['gpay'],
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
      };

      found = Translate.translateExternal(options);

      t.deepEqual(found, expected, 'Translates external options properly');

      t.end();
    });

    t.end();
  });

  t.end();
});
