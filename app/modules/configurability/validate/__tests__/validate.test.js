import * as Validate from 'configurability/validate';

describe('Module: configurability/validate', () => {
  describe('Validate.isInstrumentValidForPayment', () => {
    test('method=netbanking', async () => {
      let payment;

      payment = {
        method: 'netbanking',
        bank: 'ICIC',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'netbanking' }, payment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'ICIC'] },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'UTIB'] },
          payment
        )
      ).resolves.toBe(false);
    });

    test('method=emandate', async () => {
      let payment;

      payment = {
        method: 'emandate',
        bank: 'ICIC',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'emandate' }, payment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'emandate', banks: ['HDFC', 'ICIC'] },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'emandate', banks: ['HDFC', 'UTIB'] },
          payment
        )
      ).resolves.toBe(false);
    });

    test('method=wallet', async () => {
      let payment;

      payment = {
        method: 'wallet',
        wallet: 'freecharge',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'wallet' }, payment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'freecharge'] },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'amazonpay'] },
          payment
        )
      ).resolves.toBe(false);
    });

    test('method=cardless_emi', async () => {
      let payment;

      payment = {
        method: 'cardless_emi',
        provider: 'earlysalary',
      };

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi' },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'earlysalary'] },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'flexmoney'] },
          payment
        )
      ).resolves.toBe(false);
    });

    test('method=paylater', async () => {
      let payment;

      payment = {
        method: 'paylater',
        provider: 'epaylater',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'paylater' }, payment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['epaylater', 'icic'] },
          payment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['getsimpl', 'icic'] },
          payment
        )
      ).resolves.toBe(false);
    });

    test('method=upi', async () => {
      const vpaPayment = {
        method: 'upi',
        vpa: 'test@rzp',
      };

      const tokenPayment = {
        method: 'upi',
        token: 'tkntest',
      };

      const qrPayment = {
        method: 'upi',
        '_[flow]': 'intent',
        '_[upiqr]': '1',
      };

      const intentPayment = {
        method: 'upi',
        '_[flow]': 'intent',
        '_[app]': 'some.random.app',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'upi' }, vpaPayment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'upi' }, tokenPayment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'upi' }, qrPayment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'upi' }, intentPayment)
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          vpaPayment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          vpaPayment
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          tokenPayment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          tokenPayment
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          qrPayment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          qrPayment
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          intentPayment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          intentPayment
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          {
            method: 'upi',
            flows: ['intent', 'collect'],
            apps: ['some.random.app', 'another.random.app'],
          },
          intentPayment
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          {
            method: 'upi',
            flows: ['intent', 'collect'],
            apps: ['first.random.app', 'another.random.app'],
          },
          intentPayment
        )
      ).resolves.toBe(false);
    });

    test('method=card', async () => {
      const tokens = [
        {
          id: 'token_1',
          entity: 'token',
          token: 'tkn_one',
          bank: null,
          wallet: null,
          method: 'card',
          card: {
            entity: 'card',
            name: 'John Doe',
            last4: '0353',
            network: 'Visa',
            type: 'debit',
            issuer: 'ICIC',
            international: false,
            emi: false,
            expiry_month: 3,
            expiry_year: 2021,
            flows: {
              otp: true,
              recurring: true,
              iframe: false,
            },
            networkCode: 'visa',
          },
          vpa: null,
          recurring: false,
          auth_type: null,
          mrn: null,
          used_at: 1539620122,
          created_at: 1529910871,
          expired_at: 1617215399,
          dcc_enabled: false,
          plans: false,
          cvvDigits: 3,
          debitPin: false,
        },
        {
          id: 'token_2',
          entity: 'token',
          token: 'tkn_two',
          bank: null,
          wallet: null,
          method: 'card',
          card: {
            entity: 'card',
            name: 'Jane Doe',
            last4: '4321',
            network: 'MasterCard',
            type: 'credit',
            issuer: 'HDFC',
            international: false,
            emi: true,
            expiry_month: 11,
            expiry_year: 2022,
            flows: {
              otp: true,
              recurring: true,
              iframe: false,
            },
            networkCode: 'mastercard',
          },
          vpa: null,
          recurring: true,
          auth_type: null,
          mrn: null,
          used_at: 1587119071,
          created_at: 1574414210,
          expired_at: 1669832999,
          dcc_enabled: false,
          plans: false,
          cvvDigits: 3,
          debitPin: false,
        },
      ];

      let payment;

      payment = {
        method: 'card',
        token: 'tkn_two',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'card' }, payment, {
          tokens,
        })
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', issuers: ['HDFC', 'UTIB'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', issuers: ['ICIC', 'UTIB'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', networks: ['MasterCard', 'Visa'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', networks: ['American Express', 'Visa'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(false);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', types: ['credit', 'debit'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(true);

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'card', types: ['debit'] },
          payment,
          {
            tokens,
          }
        )
      ).resolves.toBe(false);
    });

    test('method=bank_transfer', async () => {
      let payment;

      payment = {
        method: 'bank_transfer',
      };

      await expect(
        Validate.isInstrumentValidForPayment(
          { method: 'bank_transfer' },
          payment
        )
      ).resolves.toBe(true);
    });

    test('method=paypal', async () => {
      let payment;

      payment = {
        method: 'paypal',
      };

      await expect(
        Validate.isInstrumentValidForPayment({ method: 'paypal' }, payment)
      ).resolves.toBe(true);
    });
  });
});
