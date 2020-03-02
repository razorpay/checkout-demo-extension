import * as Blocks from 'configurability/blocks';

test('Module: configurability/blocks', t => {
  test('Blocks.createBlock', t => {
    let code;
    let config;
    let expected;
    let found;

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
    };

    found = Blocks.createBlock(code, config);

    t.deepEqual(found, expected, 'Creates a block with instruments and a name');

    code = 'block.netbanking';
    config = {
      name: 'Pay via Netbanking',
      description: 'Make the paymnet using your HDFC account',
    };

    expected = {
      code: 'block.netbanking',
      type: 'block',
      title: 'Pay via Netbanking',
    };

    found = Blocks.createBlock(code, config);

    t.deepEqual(found, expected, 'Creates a block without instruments');

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
    };

    found = Blocks.createBlock(code, config);

    t.deepEqual(found, expected, 'Creates a block without a name');

    t.end();
  });

  t.end();
});
