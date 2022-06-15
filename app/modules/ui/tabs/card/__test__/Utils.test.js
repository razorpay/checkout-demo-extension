import { setupPreferences } from 'tests/setupPreferences';
import { shouldShowTnc, shouldRememberCard } from '../utils';

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

describe('Test shouldRememberCard function for subscription', () => {
  beforeEach(() => setupPreferences('subscription', razorpayInstance));
  test('Should return true if subscription and phone in domestic', () => {
    expect(shouldRememberCard(true)).toBe(true);
  });
  test('Should return true if subscription and phone in domestic', () => {
    expect(shouldRememberCard(false)).toBe(true);
  });
});

describe('Test shouldRememberCard function for caw', () => {
  beforeEach(() => setupPreferences('caw', razorpayInstance));
  test('Should return true if caw and phone in domestic', () => {
    expect(shouldRememberCard(true)).toBe(true);
  });
  test('Should return true if caw and phone in domestic', () => {
    expect(shouldRememberCard(false)).toBe(true);
  });
});

describe('Test shouldRememberCard function for non recurring', () => {
  beforeEach(() => setupPreferences('nonRecurringTest'));
  test('Should return false if non recurring & international phone', () => {
    expect(shouldRememberCard(false)).toBe(false);
  });
  test('Should return false if non recurring & domestic phone', () => {
    expect(shouldRememberCard(true)).toBe(false);
  });
});
