import { getInternationalProviders, isMethodEnabled } from '../methods';
import { hiddenMethods, hiddenInstruments } from 'checkoutstore/screens/home';

const merchantMethods = {
  app: {
    trustly: 1,
  },
};

const method = 'international';

jest.mock('razorpay', () => ({
  getMerchantMethods: () => merchantMethods,
  getOrderMethod: () => null,
}));

describe('Test getInternationalProviders', () => {
  beforeEach(() => {
    hiddenMethods.set([]);
    hiddenInstruments.set([]);
  });
  test('should return empty list if instrument is hidden', () => {
    hiddenInstruments.set([
      {
        method,
        provider: 'trustly',
      },
    ]);
    const instruments = getInternationalProviders();
    expect(instruments).toStrictEqual([]);
  });
  test('should return empty list if all apps are disabled', () => {
    hiddenMethods.set([method]);
    const instruments = getInternationalProviders();
    expect(instruments).toStrictEqual([]);
  });
  test('should return list of app for international instrument', () => {
    const instruments = getInternationalProviders();
    expect(instruments).toHaveLength(1);
    expect(instruments).toMatchObject([
      {
        code: 'trustly',
        logo: 'https://cdn.razorpay.com/international/trustly.png',
        package_name: '',
        uri: '',
      },
    ]);
  });
});

describe('Test international instrument with isMethodEnabled', () => {
  test('should return true if merchant does have trustly app', () => {
    expect(isMethodEnabled(method)).toStrictEqual(true);
  });
});
