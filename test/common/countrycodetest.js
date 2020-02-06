import findCountryCode from 'common/countrycodesutil';

test('Module: countrycodeutil', t => {
  test('Valid phone number starting with +', t => {
    const formatedNumber = findCountryCode('+918600720041');
    const expectedFormat = {
      countrycode: '91',
      phnumber: '8600720041',
    };
    t.same(formatedNumber, expectedFormat);
    t.end();
  });
  t.end();
});
