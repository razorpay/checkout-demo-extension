import * as Methods from 'configurability/methods';

describe('Module: configurability/methods', () => {
  describe('Methods.createMethodBlock', () => {
    test('Creates a method block', () => {
      let method, expected, found;

      method = 'card';

      expected = {
        method,

        code: method,
        _type: 'rzp_method',
      };

      found = Methods.createMethodBlock(method);

      expect(found).toEqual(expected);
    });
  });

  describe('Methods.clusterRazorpayBlocks', () => {
    test('Clusters blocks properly', () => {
      let blocks, expected, found;

      blocks = [
        {
          code: 'block.gpay',
          _type: 'block',
          instruments: [
            {
              method: 'upi',
              apps: ['com.google.android.apps.nbu.paisa.user'],
              flows: ['intent'],
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
              _ungrouped: [
                {
                  method: 'card',
                  issuer: 'ICIC',
                },
              ],
              method: 'card',
              issuers: ['ICIC'],
              _type: 'instrument',
            },
            {
              _ungrouped: [
                {
                  method: 'netbanking',
                  bank: 'ICIC',
                },
              ],
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
              _ungrouped: [
                {
                  app: 'com.google.android.apps.nbu.paisa.user',
                  flow: 'intent',
                  method: 'upi',
                  _type: 'instrument',
                },
              ],
              method: 'upi',
              apps: ['com.google.android.apps.nbu.paisa.user'],
              flows: ['intent'],
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
              _ungrouped: [
                {
                  code: 'netbanking',
                  _type: 'method',
                  method: 'netbanking',
                },
              ],
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
              _ungrouped: [
                {
                  issuer: 'HDFC',
                  method: 'card',
                  _type: 'instrument',
                },
              ],
              method: 'card',
              issuers: ['HDFC'],
              _type: 'instrument',
            },
            {
              _ungrouped: [
                {
                  bank: 'HDFC',
                  method: 'netbanking',
                  _type: 'instrument',
                },
              ],
              method: 'netbanking',
              banks: ['HDFC'],
              _type: 'instrument',
            },
            {
              _ungrouped: [
                {
                  wallet: 'payzapp',
                  method: 'wallet',
                  _type: 'instrument',
                },
              ],
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
              _ungrouped: [
                {
                  code: 'card',
                  _type: 'method',
                  method: 'card',
                },
              ],
              code: 'card',
              _type: 'method',
              method: 'card',
            },
            {
              _ungrouped: [
                {
                  code: 'wallet',
                  _type: 'method',
                  method: 'wallet',
                },
              ],
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
              _ungrouped: [
                {
                  method: 'card',
                  issuer: 'ICIC',
                },
              ],
              method: 'card',
              issuers: ['ICIC'],
              _type: 'instrument',
            },
            {
              _ungrouped: [
                {
                  method: 'netbanking',
                  bank: 'ICIC',
                },
              ],
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
              _ungrouped: [
                {
                  code: 'upi',
                  _type: 'method',
                  method: 'upi',
                },
              ],
              code: 'upi',
              _type: 'method',
              method: 'upi',
            },
            {
              _ungrouped: [
                {
                  code: 'gpay',
                  _type: 'method',
                  method: 'gpay',
                },
              ],
              code: 'gpay',
              _type: 'method',
              method: 'gpay',
            },
            {
              _ungrouped: [
                {
                  code: 'emi',
                  _type: 'method',
                  method: 'emi',
                },
              ],
              code: 'emi',
              _type: 'method',
              method: 'emi',
            },
            {
              _ungrouped: [
                {
                  code: 'cardless_emi',
                  _type: 'method',
                  method: 'cardless_emi',
                },
              ],
              code: 'cardless_emi',
              _type: 'method',
              method: 'cardless_emi',
            },
            {
              _ungrouped: [
                {
                  code: 'qr',
                  _type: 'method',
                  method: 'qr',
                },
              ],
              code: 'qr',
              _type: 'method',
              method: 'qr',
            },
            {
              _ungrouped: [
                {
                  code: 'paylater',
                  _type: 'method',
                  method: 'paylater',
                },
              ],
              code: 'paylater',
              _type: 'method',
              method: 'paylater',
            },
            {
              _ungrouped: [
                {
                  code: 'paypal',
                  _type: 'method',
                  method: 'paypal',
                },
              ],
              code: 'paypal',
              _type: 'method',
              method: 'paypal',
            },
            {
              _ungrouped: [
                {
                  code: 'bank_transfer',
                  _type: 'method',
                  method: 'bank_transfer',
                },
              ],
              code: 'bank_transfer',
              _type: 'method',
              method: 'bank_transfer',
            },
            {
              _ungrouped: [
                {
                  code: 'nach',
                  _type: 'method',
                  method: 'nach',
                },
              ],
              code: 'nach',
              _type: 'method',
              method: 'nach',
            },
          ],
        },
      ];

      found = Methods.clusterRazorpayBlocks(blocks);

      expect(found).toEqual(expected);
    });
  });
});
