import { findCountryCode } from 'common/countrycodesutil';

test('Module: countrycodeutil', t => {
  test('Phone number starting with +91', t => {
    const formatedNumber = findCountryCode('+918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with 91', t => {
    const formatedNumber = findCountryCode('918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', t => {
    const formatedNumber = findCountryCode('+6585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with 00', t => {
    const formatedNumber = findCountryCode('006585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number(10 digit) starting without 00 or +', t => {
    const formatedNumber = findCountryCode('6585341767');
    const expectedFormat = {
      phone: '6585341767',
      code: '91',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', t => {
    const formatedNumber = findCountryCode('+74014359556');
    const expectedFormat = {
      phone: '4014359556',
      code: '7',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting without 00 or +', t => {
    const formatedNumber = findCountryCode('39068463808');
    const expectedFormat = {
      phone: '068463808',
      code: '39',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  t.end();
});
