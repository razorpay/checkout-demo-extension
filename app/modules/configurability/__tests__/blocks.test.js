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
  {
    input: [
      {
        method: 'emandate',
        banks: ['HDFC'],
      },
      {
        method: 'emandate',
        banks: ['HDFC'],
      },
      {
        method: 'emandate',
        banks: ['HDFC'],
      },
    ],
    output: [{ method: 'emandate', banks: ['HDFC'], _type: 'instrument' }],
  },
];

describe('Module: configurability/blocks', () => {
  describe('Blocks.createBlock', () => {
    test('Instrument and name', () => {
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

      expect(found).toEqual(expected);
    });

    test('Without instruments', () => {
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

      expect(found).toEqual(expected);
    });

    test('Without name', () => {
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

      expect(found).toEqual(expected);
    });

    test('Keeps invalid instruments', () => {
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

      expect(found).toEqual(expected);
    });
  });

  describe('Blocks.validateAndCreateBlock', () => {
    test('Keeps only valid instruments', () => {
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
      expect(found).toEqual(expected);
    });
  });

  test('Blocks.validateAndCreateBlock', () => {
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

      expect(found).toEqual(expected);
    });
  });
});
