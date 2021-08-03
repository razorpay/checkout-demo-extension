import * as Validate from 'configurability/validate';

test('Module: configurability/validate', (t) => {
  test('Validate.isInstrumentValidForPayment', (t) => {
    test('method=netbanking', (t) => {
      let payment;

      payment = {
        method: 'netbanking',
        bank: 'ICIC',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'netbanking' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'ICIC'] },
          payment
        ).then((valid) =>
          t.ok(valid, 'Instrument with expected bank is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'UTIB'] },
          payment
        ).then((valid) =>
          t.notOk(valid, 'Instrument without expected bank is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=wallet', (t) => {
      let payment;

      payment = {
        method: 'wallet',
        wallet: 'freecharge',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'wallet' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'freecharge'] },
          payment
        ).then((valid) =>
          t.ok(valid, 'Instrument with expected wallet is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'amazonpay'] },
          payment
        ).then((valid) =>
          t.notOk(valid, 'Instrument without expected wallet is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=cardless_emi', (t) => {
      let payment;

      payment = {
        method: 'cardless_emi',
        provider: 'earlysalary',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'earlysalary'] },
          payment
        ).then((valid) =>
          t.ok(valid, 'Instrument with expected provider is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'flexmoney'] },
          payment
        ).then((valid) =>
          t.notOk(valid, 'Instrument without expected provider is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=paylater', (t) => {
      let payment;

      payment = {
        method: 'paylater',
        provider: 'epaylater',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'paylater' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['epaylater', 'icic'] },
          payment
        ).then((valid) =>
          t.ok(valid, 'Instrument with expected provider is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['getsimpl', 'icic'] },
          payment
        ).then((valid) =>
          t.notOk(valid, 'Instrument without expected provider is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=upi', (t) => {
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

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          vpaPayment
        ).then((valid) =>
          t.ok(valid, 'VPA Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          tokenPayment
        ).then((valid) =>
          t.ok(valid, 'Token Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment({ method: 'upi' }, qrPayment).then(
          (valid) => t.ok(valid, 'QR Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          intentPayment
        ).then((valid) =>
          t.ok(valid, 'Intent Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          vpaPayment
        ).then((valid) =>
          t.ok(valid, 'VPA Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          vpaPayment
        ).then((valid) =>
          t.notOk(
            valid,
            'VPA Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          tokenPayment
        ).then((valid) =>
          t.ok(valid, 'Token Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          tokenPayment
        ).then((valid) =>
          t.notOk(
            valid,
            'Token Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          qrPayment
        ).then((valid) =>
          t.ok(valid, 'QR Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          qrPayment
        ).then((valid) =>
          t.notOk(
            valid,
            'QR Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          intentPayment
        ).then((valid) =>
          t.ok(valid, 'Intent Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          intentPayment
        ).then((valid) =>
          t.notOk(
            valid,
            'Intent Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          {
            method: 'upi',
            flows: ['intent', 'collect'],
            apps: ['some.random.app', 'another.random.app'],
          },
          intentPayment
        ).then((valid) =>
          t.ok(valid, 'Intent Payment: Instrument with expected app is valid')
        ),

        Validate.isInstrumentValidForPayment(
          {
            method: 'upi',
            flows: ['intent', 'collect'],
            apps: ['first.random.app', 'another.random.app'],
          },
          intentPayment
        ).then((valid) =>
          t.notOk(
            valid,
            'Intent Payment: Instrument without expected app is invalid'
          )
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=card', (t) => {
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

      let tests = [
        Validate.isInstrumentValidForPayment({ method: 'card' }, payment, {
          tokens,
        }).then((valid) => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'card', issuers: ['HDFC', 'UTIB'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.ok(valid, 'Saved Card: Instrument with expected issuers is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'card', issuers: ['ICIC', 'UTIB'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.notOk(
            valid,
            'Saved Card: Instrument without expected issuers is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'card', networks: ['MasterCard', 'Visa'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.ok(valid, 'Saved Card: Instrument with expected networks is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'card', networks: ['American Express', 'Visa'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.notOk(
            valid,
            'Saved Card: Instrument without expected networks is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'card', types: ['credit', 'debit'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.ok(valid, 'Saved Card: Instrument with expected types is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'card', types: ['debit'] },
          payment,
          {
            tokens,
          }
        ).then((valid) =>
          t.notOk(
            valid,
            'Saved Card: Instrument without expected types is invalid'
          )
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=bank_transfer', (t) => {
      let payment;

      payment = {
        method: 'bank_transfer',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'bank_transfer' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=paypal', (t) => {
      let payment;

      payment = {
        method: 'paypal',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'paypal' },
          payment
        ).then((valid) => t.ok(valid, 'Method instrument is valid')),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    t.end();
  });

  t.end();
});
