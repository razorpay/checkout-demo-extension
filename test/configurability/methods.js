import * as Methods from 'configurability/methods';

test('Module: configurability/methods', t => {
  test('Methods.createMethodBlock', t => {
    test('Creates a method block', t => {
      let method, expected, found;

      method = 'card';

      expected = {
        method,

        code: method,
        type: 'rzp_method',
      };

      found = Methods.createMethodBlock(method);

      t.deepEqual(found, expected, 'Creates a method block');

      t.end();
    });

    t.end();
  });

  test('Methods.clusterRazorpayBlocks', t => {
    test('Clusters blocks properly', t => {
      let blocks, expected, found;

      blocks = [
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
          code: 'netbanking',
          type: 'rzp_method',
          method: 'netbanking',
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
          code: 'block.icici',
          type: 'block',
          instruments: [
            {
              method: 'card',
              issuers: ['ICIC'],
              type: 'instrument',
            },
            {
              method: 'netbanking',
              banks: ['ICIC'],
              type: 'instrument',
            },
          ],
          title: 'Pay via ICICI Bank',
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

      expected = [
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
          code: 'rzp.cluster',
          type: 'block',
          instruments: [
            {
              code: 'netbanking',
              type: 'method',
              method: 'netbanking',
            },
          ],
          title: 'Pay via Netbanking',
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
        {
          code: 'rzp.cluster',
          type: 'block',
          instruments: [
            {
              code: 'card',
              type: 'method',
              method: 'card',
            },
            {
              code: 'wallet',
              type: 'method',
              method: 'wallet',
            },
          ],
          title: 'Cards and Wallets',
        },
        {
          code: 'block.icici',
          type: 'block',
          instruments: [
            {
              method: 'card',
              issuers: ['ICIC'],
              type: 'instrument',
            },
            {
              method: 'netbanking',
              banks: ['ICIC'],
              type: 'instrument',
            },
          ],
          title: 'Pay via ICICI Bank',
        },
        {
          code: 'rzp.cluster',
          type: 'block',
          instruments: [
            {
              code: 'upi',
              type: 'instrument',
              method: 'upi',
            },
            {
              code: 'gpay',
              type: 'instrument',
              method: 'gpay',
            },
            {
              code: 'emi',
              type: 'instrument',
              method: 'emi',
            },
            {
              code: 'cardless_emi',
              type: 'instrument',
              method: 'cardless_emi',
            },
            {
              code: 'qr',
              type: 'instrument',
              method: 'qr',
            },
            {
              code: 'paylater',
              type: 'instrument',
              method: 'paylater',
            },
            {
              code: 'paypal',
              type: 'instrument',
              method: 'paypal',
            },
            {
              code: 'bank_transfer',
              type: 'instrument',
              method: 'bank_transfer',
            },
            {
              code: 'nach',
              type: 'instrument',
              method: 'nach',
            },
          ],
          title: 'UPI, Google Pay & More',
        },
      ];

      found = Methods.clusterRazorpayBlocks(blocks);

      t.deepEqual(found, expected, 'Clusters blocks properly');

      t.end();
    });

    t.end();
  });

  t.end();
});
