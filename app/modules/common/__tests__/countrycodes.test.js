import { findCountryCode } from 'common/countrycodes';

describe('Module: countrycodeutil', () => {
  test('Phone number starting with +91', () => {
    const formatedNumber = findCountryCode('+918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number starting with 91', () => {
    const formatedNumber = findCountryCode('918600720041');
    const expectedFormat = {
      phone: '8600720041',
      code: '91',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number starting with +', () => {
    const formatedNumber = findCountryCode('+6585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number starting with 00', () => {
    const formatedNumber = findCountryCode('006585341767');
    const expectedFormat = {
      phone: '85341767',
      code: '65',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number(10 digit) starting without 00 or +', () => {
    const formatedNumber = findCountryCode('6585341767');
    const expectedFormat = {
      phone: '6585341767',
      code: '91',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number starting with +', () => {
    const formatedNumber = findCountryCode('+74014359556');
    const expectedFormat = {
      phone: '4014359556',
      code: '7',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Phone number starting without 00 or +', () => {
    const formatedNumber = findCountryCode('39068463808');
    const expectedFormat = {
      phone: '068463808',
      code: '39',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('Indian phone nubmer starting with 0', () => {
    const formatedNumber = findCountryCode('09988776655');
    const expectedFormat = {
      phone: '9988776655',
      code: '91',
    };
    expect(formatedNumber).toEqual(expectedFormat);
  });

  test('American: (541) 754-3010', () => {
    const formatted = findCountryCode('(541) 754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    expect(formatted).toEqual(expected);
  });

  test('American: 1-541-754-3010', () => {
    const formatted = findCountryCode('1-541-754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    expect(formatted).toEqual(expected);
  });

  test('American: +1-541-754-3010', () => {
    const formatted = findCountryCode('+1-541-754-3010');
    const expected = {
      phone: '5417543010',
      code: '1',
    };

    expect(formatted).toEqual(expected);
  });

  test('Malaysian: +60132758793', () => {
    const formatted = findCountryCode('+60132758793');
    const expected = {
      phone: '132758793',
      code: '60',
    };

    expect(formatted).toEqual(expected);
  });

  test('Malaysian: 132758793', () => {
    const formatted = findCountryCode('132758793');
    const expected = {
      phone: '132758793',
      code: '60',
    };

    expect(formatted).toEqual(expected);
  });

  test('Malaysian: 0132758793', () => {
    const formatted = findCountryCode('0132758793');
    const expected = {
      phone: '132758793',
      code: '60',
    };

    expect(formatted).toEqual(expected);
  });
});
