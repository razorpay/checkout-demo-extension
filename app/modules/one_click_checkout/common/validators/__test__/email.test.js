const {
  isDomainWhitelisted,
  isEmailValidRegex,
  mxRecordsExist,
  validateEmail,
} = require('../email');

jest.mock('../email', () => {
  const originalModule = jest.requireActual('../email');
  return {
    __esModule: true,
    ...originalModule,
    mxRecordsExist: jest.fn((domain) => {
      if (domain === 'domain.com') return Promise.resolve(true);
      if (domain === 'gmail.com') return Promise.resolve(true);
      if (domain === 'xyz.com') return Promise.resolve(false);
      if (domain === 'networkfailed.com') return Promise.resolve(true);
    }),
  };
});

describe('email regex validator', () => {
  test('razor.razorpay.com fails regex', () => {
    expect(isEmailValidRegex('razor.razorpay.com')).toBe(false);
  });

  test('razorHappy@razorpay fails regex', () => {
    expect(isEmailValidRegex('razor.razorpay.com')).toBe(false);
  });

  test('razor@razorpay.com matches regex', () => {
    expect(isEmailValidRegex('razor@razorpay.com')).toBe(true);
  });
});

describe('domain whitelisting validator', () => {
  test('gmail.com is whitelisted', () => {
    expect(isDomainWhitelisted('gmail.com')).toBe(true);
  });

  test('xyzmail.com is not whitelisted', () => {
    expect(isDomainWhitelisted('xyzmail.com')).toBe(false);
  });
});

describe('domain mx records validator', () => {
  test('gmail.com returns true', () => {
    expect(mxRecordsExist('gmail.com')).resolves.toBe(true);
  });

  test('xyz.com returns false', () => {
    expect(mxRecordsExist('xyz.com')).resolves.toBe(false);
  });

  test('networkfailed.com throws error', () => {
    expect(mxRecordsExist('networkfailed.com')).resolves.toBe(true);
  });
});

describe('email validator', () => {
  test('goutam.goutam.com resolves to false', () => {
    expect(validateEmail('goutam.goutam.com')).resolves.toBe(false);
  });
  test('goutam@xyz.com resolved to false', () => {
    expect(validateEmail('goutam@xyz.com')).resolves.toBe(false);
  });
  test('goutam@gmail.com resolves to true', () => {
    expect(validateEmail('goutam@gmail.com')).resolves.toBe(true);
  });
  test('goutam@domain.com resolved to true', () => {
    expect(validateEmail('goutam@domain.com')).resolves.toBe(true);
  });
  test('goutam@networkfailed.com resolved to true', () => {
    expect(validateEmail('goutam@networkfailed.com')).resolves.toBe(true);
  });
});
