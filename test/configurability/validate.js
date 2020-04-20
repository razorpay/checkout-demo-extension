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

    t.end();
  });

  t.end();
});
