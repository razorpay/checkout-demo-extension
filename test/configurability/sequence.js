import * as Sequence from 'configurability/sequence';

test('Module: configurability/sequence', (t) => {
  test('Sequence.getSequencedBlocks', (t) => {
    test('Sequences blocks properly with default blocks', (t) => {
      let params, expected, found;

      params = {
        translated: {
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
                  networks: ['MasterCard'],
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
            preferences: {},
            sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
          },
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
          'app',
        ],
      };

      expected = {
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
            code: 'netbanking',
            _type: 'rzp_method',
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
            _type: 'rzp_method',
            method: 'card',
          },
          {
            code: 'wallet',
            _type: 'rzp_method',
            method: 'wallet',
          },
          {
            code: 'upi',
            _type: 'rzp_method',
            method: 'upi',
          },
          {
            code: 'gpay',
            _type: 'rzp_method',
            method: 'gpay',
          },
          {
            code: 'cardless_emi',
            _type: 'rzp_method',
            method: 'cardless_emi',
          },
          {
            code: 'qr',
            _type: 'rzp_method',
            method: 'qr',
          },
          {
            code: 'paylater',
            _type: 'rzp_method',
            method: 'paylater',
          },
          {
            code: 'paypal',
            _type: 'rzp_method',
            method: 'paypal',
          },
          {
            code: 'bank_transfer',
            _type: 'rzp_method',
            method: 'bank_transfer',
          },
          {
            code: 'nach',
            _type: 'rzp_method',
            method: 'nach',
          },
        ],

        sequence: [
          'block.gpay',
          'netbanking',
          'block.hdfc',
          'card',
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
          'app',
        ],
      };

      found = Sequence.getSequencedBlocks(params);

      t.deepEqual(
        found,
        expected,
        'Sequences blocks properly with default block'
      );

      t.end();
    });

    test('Sequences blocks properly without default blocks', (t) => {
      let params, expected, found;

      params = {
        translated: {
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
                  networks: ['MasterCard'],
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
            preferences: {
              show_default_blocks: false,
            },
            sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
          },
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
          'app',
        ],
      };

      expected = {
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
            code: 'netbanking',
            _type: 'rzp_method',
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
        ],

        sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
      };

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
