import * as Validate from 'configurability/validate';

test('Module: configurability/validate', t => {
  test('Validate.isInstrumentValidForPayment', t => {
    test('method=netbanking', t => {
      let payment;

      payment = {
        method: 'netbanking',
        bank: 'ICIC',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'netbanking' },
          payment
        ).then(valid => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'ICIC'] },
          payment
        ).then(valid => t.ok(valid, 'Instrument with expected bank is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'netbanking', banks: ['HDFC', 'UTIB'] },
          payment
        ).then(valid =>
          t.notOk(valid, 'Instrument without expected bank is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=wallet', t => {
      let payment;

      payment = {
        method: 'wallet',
        wallet: 'freecharge',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'wallet' },
          payment
        ).then(valid => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'freecharge'] },
          payment
        ).then(valid =>
          t.ok(valid, 'Instrument with expected wallet is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'wallet', wallets: ['olamoney', 'amazonpay'] },
          payment
        ).then(valid =>
          t.notOk(valid, 'Instrument without expected wallet is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=cardless_emi', t => {
      let payment;

      payment = {
        method: 'cardless_emi',
        provider: 'earlysalary',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi' },
          payment
        ).then(valid => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'earlysalary'] },
          payment
        ).then(valid =>
          t.ok(valid, 'Instrument with expected provider is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'cardless_emi', providers: ['zestmoney', 'flexmoney'] },
          payment
        ).then(valid =>
          t.notOk(valid, 'Instrument without expected provider is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=paylater', t => {
      let payment;

      payment = {
        method: 'paylater',
        provider: 'epaylater',
      };

      let tests = [
        Validate.isInstrumentValidForPayment(
          { method: 'paylater' },
          payment
        ).then(valid => t.ok(valid, 'Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['epaylater', 'icic'] },
          payment
        ).then(valid =>
          t.ok(valid, 'Instrument with expected provider is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'paylater', providers: ['getsimpl', 'icic'] },
          payment
        ).then(valid =>
          t.notOk(valid, 'Instrument without expected provider is invalid')
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    test('method=upi', t => {
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
        ).then(valid => t.ok(valid, 'VPA Payment: Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          tokenPayment
        ).then(valid =>
          t.ok(valid, 'Token Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          qrPayment
        ).then(valid => t.ok(valid, 'QR Payment: Method instrument is valid')),

        Validate.isInstrumentValidForPayment(
          { method: 'upi' },
          intentPayment
        ).then(valid =>
          t.ok(valid, 'Intent Payment: Method instrument is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          vpaPayment
        ).then(valid =>
          t.ok(valid, 'VPA Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          vpaPayment
        ).then(valid =>
          t.notOk(
            valid,
            'VPA Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          tokenPayment
        ).then(valid =>
          t.ok(valid, 'Token Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'intent'] },
          tokenPayment
        ).then(valid =>
          t.notOk(
            valid,
            'Token Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          qrPayment
        ).then(valid =>
          t.ok(valid, 'QR Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          qrPayment
        ).then(valid =>
          t.notOk(
            valid,
            'QR Payment: Instrument without expected flow is invalid'
          )
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['intent', 'collect'] },
          intentPayment
        ).then(valid =>
          t.ok(valid, 'Intent Payment: Instrument with expected flow is valid')
        ),

        Validate.isInstrumentValidForPayment(
          { method: 'upi', flows: ['qr', 'collect'] },
          intentPayment
        ).then(valid =>
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
        ).then(valid =>
          t.ok(valid, 'Intent Payment: Instrument with expected app is valid')
        ),

        Validate.isInstrumentValidForPayment(
          {
            method: 'upi',
            flows: ['intent', 'collect'],
            apps: ['first.random.app', 'another.random.app'],
          },
          intentPayment
        ).then(valid =>
          t.notOk(
            valid,
            'Intent Payment: Instrument without expected app is invalid'
          )
        ),
      ];

      Promise.all(tests).finally(() => t.end());
    });

    t.end();
  });

  t.end();
});
