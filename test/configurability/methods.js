import * as Methods from 'configurability/methods';

test('Module: configurability/methods', t => {
  test('Methods.createMethodBlock', t => {
    test('Creates a method block', t => {
      let method, expected, found;

      method = 'card';

      expected = {
        method,

        code: method,
        _type: 'rzp_method',
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
          _type: 'block',
          instruments: [
            {
              method: 'upi',
              apps: ['google_pay'],
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
          code: 'block.icici',
          _type: 'block',
          instruments: [
            {
              method: 'card',
              issuers: ['ICIC'],
              _type: 'instrument',
            },
            {
              method: 'netbanking',
              banks: ['ICIC'],
              _type: 'instrument',
            },
          ],
          title: 'Pay via ICICI Bank',
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
          code: 'emi',
          _type: 'rzp_method',
          method: 'emi',
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
      ];

      expected = [
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
          code: 'rzp.cluster',
          _type: 'block',
          instruments: [
            {
              code: 'netbanking',
              _type: 'method',
              method: 'netbanking',
            },
          ],
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
          code: 'rzp.cluster',
          _type: 'block',
          instruments: [
            {
              code: 'card',
              _type: 'method',
              method: 'card',
            },
            {
              code: 'wallet',
              _type: 'method',
              method: 'wallet',
            },
          ],
        },
        {
          code: 'block.icici',
          _type: 'block',
          instruments: [
            {
              method: 'card',
              issuers: ['ICIC'],
              _type: 'instrument',
            },
            {
              method: 'netbanking',
              banks: ['ICIC'],
              _type: 'instrument',
            },
          ],
          title: 'Pay via ICICI Bank',
        },
        {
          code: 'rzp.cluster',
          _type: 'block',
          instruments: [
            {
              code: 'upi',
              _type: 'instrument',
              method: 'upi',
            },
            {
              code: 'gpay',
              _type: 'instrument',
              method: 'gpay',
            },
            {
              code: 'emi',
              _type: 'instrument',
              method: 'emi',
            },
            {
              code: 'cardless_emi',
              _type: 'instrument',
              method: 'cardless_emi',
            },
            {
              code: 'qr',
              _type: 'instrument',
              method: 'qr',
            },
            {
              code: 'paylater',
              _type: 'instrument',
              method: 'paylater',
            },
            {
              code: 'paypal',
              _type: 'instrument',
              method: 'paypal',
            },
            {
              code: 'bank_transfer',
              _type: 'instrument',
              method: 'bank_transfer',
            },
            {
              code: 'nach',
              _type: 'instrument',
              method: 'nach',
            },
          ],
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
