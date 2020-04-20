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

    t.end();
  });

  t.end();
});
