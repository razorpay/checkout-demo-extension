import { findCountryCode } from 'common/countrycodes';

test('Module: countrycodeutil', (t) => {
  test('Phone number starting with +91', (t) => {
    const formatedNumber = findCountryCode('+918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with 91', (t) => {
    const formatedNumber = findCountryCode('918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', (t) => {
    const formatedNumber = findCountryCode('+6585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with 00', (t) => {
    const formatedNumber = findCountryCode('006585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number(10 digit) starting without 00 or +', (t) => {
    const formatedNumber = findCountryCode('6585341767');
    const expectedFormat = {
      phone: '6585341767',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', (t) => {
    const formatedNumber = findCountryCode('+74014359556');
    const expectedFormat = {
      phone: '4014359556',
      code: '7',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting without 00 or +', (t) => {
    const formatedNumber = findCountryCode('39068463808');
    const expectedFormat = {
      phone: '068463808',
      code: '39',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Indian phone nubmer starting with 0', (t) => {
    const formatedNumber = findCountryCode('09988776655');
    const expectedFormat = {
      phone: '9988776655',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('American: (541) 754-3010', (t) => {
    const formatted = findCountryCode('(541) 754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    t.same(formatted, expected);
    t.end();
  });

  test('American: 1-541-754-3010', (t) => {
    const formatted = findCountryCode('1-541-754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    t.same(formatted, expected);
    t.end();
  });

  test('American: +1-541-754-3010', (t) => {
    const formatted = findCountryCode('+1-541-754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    t.same(formatted, expected);
    t.end();
  });

  t.end();
});
