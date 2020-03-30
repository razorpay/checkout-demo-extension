import * as Sequence from 'configurability/sequence';

test('Module: configurability/sequence', t => {
  test('Sequence.getSequencedBlocks', t => {
    test('Sequences blocks properly with default blocks', t => {
      let params, expected, found;

      params = {
        translated: {
          blocks: [
            {
              code: 'block.gpay',
              _type: 'block',
              instruments: [
                {
                  method: 'upi',
                  apps: ['googlepay'],
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
        },
        original: {
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
          settings: {
            methods: {
              upi: false,
            },
          },
          sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
        },
        methods: [
          'card',
          'netbanking',
          'wallet',
          'upi',
          'gpay',
          'emi',
          'cardless_emi',
          'qr',
          'paylater',
          'paypal',
          'bank_transfer',
          'nach',
        ],
      };

      expected = [
        {
          code: 'block.gpay',
          _type: 'block',
          instruments: [
            {
              method: 'upi',
              apps: ['googlepay'],
              _type: 'instrument',
            },
          ],
          title: 'Pay via Google Pay',
        },
        {
          code: 'netbanking',
          type: 'rzp_method',
          method: 'netbanking',
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
        {
          code: 'card',
          type: 'rzp_method',
          method: 'card',
        },
        {
          code: 'wallet',
          type: 'rzp_method',
          method: 'wallet',
        },
        {
          code: 'upi',
          type: 'rzp_method',
          method: 'upi',
        },
        {
          code: 'gpay',
          type: 'rzp_method',
          method: 'gpay',
        },
        {
          code: 'emi',
          type: 'rzp_method',
          method: 'emi',
        },
        {
          code: 'cardless_emi',
          type: 'rzp_method',
          method: 'cardless_emi',
        },
        {
          code: 'qr',
          type: 'rzp_method',
          method: 'qr',
        },
        {
          code: 'paylater',
          type: 'rzp_method',
          method: 'paylater',
        },
        {
          code: 'paypal',
          type: 'rzp_method',
          method: 'paypal',
        },
        {
          code: 'bank_transfer',
          type: 'rzp_method',
          method: 'bank_transfer',
        },
        {
          code: 'nach',
          type: 'rzp_method',
          method: 'nach',
        },
      ];

      found = Sequence.getSequencedBlocks(params);

      t.deepEqual(
        found,
        expected,
        'Sequences blocks properly with default block'
      );

      t.end();
    });

    test('Sequences blocks properly without default blocks', t => {
      let params, expected, found;

      params = {
        translated: {
          blocks: [
            {
              code: 'block.gpay',
              _type: 'block',
              instruments: [
                {
                  method: 'upi',
                  apps: ['googlepay'],
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
        },
        original: {
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
          settings: {
            show_default_blocks: false,
          },
          sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
        },
        methods: [
          'card',
          'netbanking',
          'wallet',
          'upi',
          'gpay',
          'emi',
          'cardless_emi',
          'qr',
          'paylater',
          'paypal',
          'bank_transfer',
          'nach',
        ],
      };

      expected = [
        {
          code: 'block.gpay',
          _type: 'block',
          instruments: [
            {
              method: 'upi',
              apps: ['googlepay'],
              _type: 'instrument',
            },
          ],
          title: 'Pay via Google Pay',
        },
        {
          code: 'netbanking',
          type: 'rzp_method',
          method: 'netbanking',
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
      ];

      found = Sequence.getSequencedBlocks(params);

      t.deepEqual(
        found,
        expected,
        'Sequences blocks properly without default blocks'
      );

      t.end();
    });

    t.end();
  });

  t.end();
});
