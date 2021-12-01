import * as Blocks from 'configurability/blocks';
const testDataForDuplicateConfigValidation = [
  {
    input: [
      {
        method: 'card',
        types: ['credit'],
      },
      {
        method: 'card',
        types: ['debit'],
      },
      {
        method: 'card',
        types: ['debit'],
      },
      {
        method: 'card',
        types: ['debit'],
      },
      {
        method: 'card',
        types: ['debit'],
      },
      {
        method: 'card',
        types: ['debit'],
      },
      {
        method: 'card',
        types: ['credit'],
      },
    ],
    output: [
      { method: 'card', types: ['credit'], _type: 'instrument' },
      { method: 'card', types: ['debit'], _type: 'instrument' },
    ],
  },
  {
    input: [
      {
        method: 'cardless_emi',
        providers: ['walnut369', 'walnut369'],
      },
    ],
    output: [
      { method: 'cardless_emi', providers: ['walnut369'], _type: 'instrument' },
    ],
  },
  {
    input: [
      {
        method: 'cardless_emi',
        providers: ['walnut369', 'walnut369'],
      },
      {
        method: 'cardless_emi',
        providers: ['walnut369', 'walnut369'],
      },
    ],
    output: [
      { method: 'cardless_emi', providers: ['walnut369'], _type: 'instrument' },
    ],
  },
  {
    input: [
      {
        method: 'cardless_emi',
        providers: ['walnut369', 'walnut369'],
      },
      {
        method: 'cardless_emi',
        providers: ['walnut369'],
      },
    ],
    output: [
      { method: 'cardless_emi', providers: ['walnut369'], _type: 'instrument' },
    ],
  },
  {
    input: [
      {
        method: 'emi',
      },
      {
        method: 'emi',
      },
      {
        method: 'emi',
      },
      {
        method: 'emi',
      },
      {
        method: 'emi',
      },
      {
        method: 'emi',
      },
    ],
    output: [{ method: 'emi', _type: 'method' }],
  },
];

test('Module: configurability/blocks', (t) => {
  test('Blocks.createBlock', (t) => {
    test('Instrument and name', (t) => {
      let code, config, expected, found;

      code = 'block.hdfc';
      config = {
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
      };

      expected = {
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
      };

      found = Blocks.createBlock(code, config);

      t.deepEqual(
        found,
        expected,
        'Creates a block with instruments and a name'
      );

      t.end();
    });

    test('Without instruments', (t) => {
      let code, config, expected, found;

      code = 'block.netbanking';
      config = {
        name: 'Pay via Netbanking',
        description: 'Make the paymnet using your HDFC account',
      };

      expected = {
        code: 'block.netbanking',
        _type: 'block',
        title: 'Pay via Netbanking',
      };

      found = Blocks.createBlock(code, config);

      t.deepEqual(found, expected, 'Creates a block without instruments');

      t.end();
    });

    test('Without name', (t) => {
      let code, config, expected, found;

      code = 'block.hdfc';
      config = {
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
      };

      expected = {
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
      };

      found = Blocks.createBlock(code, config);

      t.deepEqual(found, expected, 'Creates a block without a name');

      t.end();
    });

    test('Keeps invalid instruments', (t) => {
      let code, config, expected, found;

      code = 'block.hdfc';
      config = {
        name: 'Pay via HDFC Bank',
        description: 'Make the paymnet using your HDFC account',
        instruments: [
          {
            method: 'card',
            issuer: ['HDFC'],
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
      };

      expected = {
        code: 'block.hdfc',
        _type: 'block',
        instruments: [
          {
            method: 'card',
            issuer: ['HDFC'],
            _type: 'method',
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
      };

      found = Blocks.createBlock(code, config);

      t.deepEqual(found, expected, 'Creates a block with invalid instruments');

      t.end();
    });

    t.end();
  });

  test('Blocks.validateAndCreateBlock', (t) => {
    test('Keeps only valid instruments', (t) => {
      let code, config, expected, found;
      code = 'block.hdfc';
      config = {
        name: 'Pay via HDFC Bank',
        description: 'Make the paymnet using your HDFC account',
        instruments: [
          {
            method: 'card',
            issuer: ['HDFC'],
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
      };

      expected = {
        code: 'block.hdfc',
        _type: 'block',
        instruments: [
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
      };

      found = Blocks.validateAndCreateBlock(code, config);

      t.deepEqual(
        found,
        expected,
        'Creates a block with only valid instruments'
      );

      t.end();
    });

    t.end();
  });
  test('Blocks.validateAndCreateBlock', (t) => {
    testDataForDuplicateConfigValidation.forEach(({ input, output }) => {
      let code, config, expected, found;
      code = 'block.hdfc';
      config = {
        name: 'Pay via HDFC Bank',
        description: 'Make the paymnet using your HDFC account',
        instruments: input,
      };

      expected = {
        code: 'block.hdfc',
        _type: 'block',
        instruments: output,
        title: 'Pay via HDFC Bank',
      };

      found = Blocks.validateAndCreateBlock(code, config);

      t.deepEqual(
        found,
        expected,
        'Creates a block with only valid instruments'
      );
    });
    t.end();
  });
  t.end();
});
