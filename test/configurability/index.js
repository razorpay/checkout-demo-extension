import * as Configurability from 'configurability';

test('Module: configurability', t => {
  test('Configurability.getBlockConfig', t => {
    test('Retrieves the expected block config', t => {
      let config, expected, found;

      config = {
        display: {
          blocks: {
            gpay: {
              name: 'Pay via Google Pay',
              description: 'Make a payment using your Google Pay app',
              instruments: [
                {
                  method: 'upi',
                  apps: ['google_pay'],
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
              networks: ['MasterCard'],
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
          sequence: ['block.gpay', 'netbanking', 'block.hdfc'],
        },
      };

      expected = {
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
              code: 'rzp.cluster',
              _type: 'block',
              instruments: [
                {
                  code: 'netbanking',
                  _type: 'method',
                  method: 'netbanking',
                },
              ],
              title: 'Pay via Netbanking',
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
              title: 'Cards, Wallets & More',
            },
          ],
        },
      };

      found = Configurability.getBlockConfig(config);

      t.deepEqual(found, expected, 'Retrieves the expected block config');

      t.end();
    });

    t.end();
  });

  t.end();
});
