import findCountryCode from 'common/countrycodesutil';

test('Module: countrycodeutil', t => {
  test('Valid indian phone number starting with +91', t => {
    const formatedNumber = findCountryCode('+918600720041');
    const expectedFormat = {
      countrycode: '91',
      phnumber: '8600720041',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Valid indian phone number starting with 91', t => {
    const formatedNumber = findCountryCode('918600720041');
    const expectedFormat = {
      countrycode: '91',
      phnumber: '8600720041',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', t => {
    const formatedNumber = findCountryCode('+6585341767');
    const expectedFormat = {
      countrycode: '65',
      phnumber: '85341767',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Valid international phone number starting with 00', t => {
    const formatedNumber = findCountryCode('006585341767');
    const expectedFormat = {
      countrycode: '65',
      phnumber: '85341767',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number(10 digit) starting without 00 or +', t => {
    const formatedNumber = findCountryCode('6585341767');
    const expectedFormat = {
      countrycode: '91',
      phnumber: '6585341767',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting with +', t => {
    const formatedNumber = findCountryCode('+74014359556');
    const expectedFormat = {
      countrycode: '7',
      phnumber: '4014359556',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  test('Phone number starting without 00 or +', t => {
    const formatedNumber = findCountryCode('39068463808');
    const expectedFormat = {
      countrycode: undefined,
      phnumber: '39068463808',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });

  t.end();
});
