import { setupPreferences } from 'tests/setupPreferences';
import { shouldShowTnc } from '../utils';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg) => arg,
};

const preferencesOverride = {
  features: {
    show_mor_tnc: true,
  },
};

describe('Test showTnC without feature flag', () => {
  beforeEach(() => setupPreferences('internationalTests', razorpayInstance));
  test('Should return false if feature flag is disabled', () => {
    expect(shouldShowTnc()).toBe(false);
  });
});

describe('Test showTnC with feature flag', () => {
  beforeEach(() =>
    setupPreferences(
      'internationalTests',
      razorpayInstance,
      preferencesOverride
    )
  );
  test('Should return false if country and currency is null', () => {
    expect(shouldShowTnc(null, null)).toBe(false);
  });
  test('Should return false if country is non US', () => {
    expect(shouldShowTnc(null, 'IN')).toBe(false);
  });
  test('Should return false if currency is non USD', () => {
    expect(shouldShowTnc('INR')).toBe(false);
  });
  test('Should return true if currency is USD', () => {
    expect(shouldShowTnc('USD')).toBe(true);
  });
  test('Should return true if country is US', () => {
    expect(shouldShowTnc(null, 'US')).toBe(true);
  });
  test('Should return true if currency is USD and country is US', () => {
    expect(shouldShowTnc('USD', 'US')).toBe(true);
    expect(shouldShowTnc('INR', 'US')).toBe(false);
    expect(shouldShowTnc('USD', 'IN')).toBe(true);
    expect(shouldShowTnc(null, 'IN')).toBe(false);
    expect(shouldShowTnc(null, 'US')).toBe(true);
  });
});
