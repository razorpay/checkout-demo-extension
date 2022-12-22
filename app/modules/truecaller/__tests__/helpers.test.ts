import { getSDKMeta } from 'checkoutstore/native';
import { isLoggedIn } from 'checkoutstore/customer';
import { shouldRememberCustomer } from 'checkoutstore';
import {
  getCurrency,
  getOption,
  getPreferences,
  isContactHidden,
} from 'razorpay';
import {
  sanitizeOverrideConfig,
  isTruecallerLoginEnabled,
  getTruecallerLanguageCodeForCheckout,
  getCurrentTruecallerRequestId,
} from '../helpers';
import {
  truecallerPresent,
  truecallerUserMetric,
  truecallerAttemptCount,
} from '../store';

import type { OverrideConfig } from '../types';

jest.mock('checkoutstore/native', () => ({
  getSDKMeta: jest.fn(() => ({
    platform: 'web',
  })),
}));

jest.mock('checkoutstore/index', () => ({
  shouldRememberCustomer: jest.fn(() => true),
}));

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getOption: jest.fn(),
  isContactHidden: jest.fn(),
  getPreferences: jest.fn(),
  getCurrency: jest.fn(() => 'INR'),
  isRedesignV15: jest.fn(() => true),
}));

jest.mock('common/useragent', () => ({
  ...jest.requireActual('common/useragent'),
  android: true,
  iOS: false,
  isBrave: false,
  isDesktop: false,
  chrome: true,
}));

describe('sanitizeOverrideConfig tests', () => {
  test('should throw error if requestNonce is not passed', async () => {
    expect(() => {
      sanitizeOverrideConfig({ lang: 'en' } as OverrideConfig);
    }).toThrow(Error);
  });

  test('should ignore params if not valid', async () => {
    expect(
      sanitizeOverrideConfig({
        requestNonce: '00000000',
        ctaColor: 'fafafa',
        ctaTextColor: '#00x',
      })
    ).toStrictEqual({ requestNonce: '00000000' });

    expect(
      sanitizeOverrideConfig({
        requestNonce: '00000000',
        ctaColor: '#fafafa',
        ctaTextColor: '#000000',
      })
    ).toStrictEqual({
      requestNonce: '00000000',
      ctaColor: '#fafafa',
      ctaTextColor: '#000000',
    });
  });
});

describe('isTruecallerLoginEnabled tests', () => {
  beforeEach(() => {
    isLoggedIn.set(false);
    truecallerAttemptCount.set(0);

    truecallerUserMetric.set({ skipped_count: 0, timestamp: 1667815483823 });

    (getOption as unknown as jest.Mock).mockImplementation((param) => {
      if (['features.truecaller_login'].includes(param)) {
        return true;
      }
      return jest.requireActual('razorpay').getOption(param);
    });

    (getPreferences as unknown as jest.Mock).mockImplementation((param) => {
      if (param === 'truecaller.request_id') {
        return '4ht75gduvny5nl6lv738omuyxwctw0vgttzc6hlxne9w2jjklk7iyqsmi9e9k';
      }

      if (param === 'experiments.truecaller_standard_checkout_for_prefill') {
        return 'home_and_access_saved_cards_and_add_card';
      }

      if (
        [
          'features.truecaller.login',
          'features.truecaller.login_mweb',
          'features.truecaller.login_contact_screen',
          'features.truecaller.login_home_screen',
          'features.truecaller.login_saved_cards_screen',
          'features.truecaller.login_add_new_card_screen',
        ].includes(param)
      ) {
        return true;
      }
      return jest.requireActual('razorpay').getPreferences(param);
    });
  });

  test('should be disabled if feature is disabled for merchant', async () => {
    (getOption as unknown as jest.Mock).mockImplementationOnce((param) => {
      if (param === 'features.truecaller_login') {
        return false;
      }
      return jest.requireActual('razorpay').getOption(param);
    });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be disabled if contact is readonly', async () => {
    (isContactHidden as unknown as jest.Mock).mockImplementationOnce(() => {
      return true;
    });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be enabled for android mweb', async () => {
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(true);
  });

  test('should be disabled if platform is not android mweb', async () => {
    (getSDKMeta as jest.Mock).mockReturnValueOnce({
      platform: 'ios',
    });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be disabled if user already logged in', async () => {
    isLoggedIn.set(true);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be disabled if currency is non-INR', async () => {
    (getCurrency as jest.Mock).mockReturnValueOnce('USD');
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be disabled if truecaller is not found', async () => {
    truecallerPresent.set(false);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be enabled if truecaller identification is not attempted', async () => {
    truecallerPresent.set(null);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(true);
  });

  test('should be enabled if skip count is less than 3', async () => {
    truecallerUserMetric.set({ skipped_count: 2, timestamp: 1667815483823 });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(true);
  });

  test('should be disabled if skip count is 3 or more', async () => {
    truecallerUserMetric.set({ skipped_count: 3, timestamp: 1667815483823 });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be enabled if request id is present in preferences', async () => {
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(true);
  });

  test('should be disabled if request id is not present in preferences', async () => {
    (getPreferences as unknown as jest.Mock).mockImplementation((param) => {
      if (param === 'truecaller.request_id') {
        return null;
      }
      return jest.requireActual('razorpay').getPreferences(param);
    });
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be disabled if last attempt count is last 2 digit number', async () => {
    truecallerAttemptCount.set(99);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });

  test('should be enabled if last attempt count is not last 2 digit number', async () => {
    truecallerAttemptCount.set(98);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(true);
  });

  test('should be disabled if remember customer is false', async () => {
    (shouldRememberCustomer as jest.Mock).mockReturnValueOnce(false);
    expect(isTruecallerLoginEnabled('access_saved_cards').status).toBe(false);
  });
});

describe('getTruecallerLanguageCodeForCheckout tests', () => {
  test('should translate checkout lang code to truecaller lang code', async () => {
    expect(getTruecallerLanguageCodeForCheckout('en')).toBe('en');
    expect(getTruecallerLanguageCodeForCheckout('hi')).toBe('hi');
    expect(getTruecallerLanguageCodeForCheckout('mar')).toBe('mr');
    expect(getTruecallerLanguageCodeForCheckout('tel')).toBe('te');
    expect(getTruecallerLanguageCodeForCheckout('tam')).toBe('ta');
    expect(getTruecallerLanguageCodeForCheckout('ben')).toBe('bn');
  });
});

describe('getCurrentTruecallerRequestId tests', () => {
  beforeEach(() => {
    (getPreferences as unknown as jest.Mock).mockImplementation((param) => {
      if (param === 'truecaller.request_id') {
        return '4ht75gduvny5nl6lv738omuyxwctw0vgttzc6hlxne9w2jjklk7iyqsmi9e9k';
      }
      return jest.requireActual('razorpay').getPreferences(param);
    });
  });
  test('should give full request id based on base id for 1 digit attempt count', async () => {
    truecallerAttemptCount.set(1);
    expect(getCurrentTruecallerRequestId()).toBe(
      '4ht75gduvny5nl6lv738omuyxwctw0vgttzc6hlxne9w2jjklk7iyqsmi9e9k-01'
    );
  });
  test('should give full request id based on base id for 2 digit attempt count', async () => {
    truecallerAttemptCount.set(10);
    expect(getCurrentTruecallerRequestId()).toBe(
      '4ht75gduvny5nl6lv738omuyxwctw0vgttzc6hlxne9w2jjklk7iyqsmi9e9k-10'
    );
  });
  test('should only pick 64 chars when attempt count is more that 2 digits', async () => {
    truecallerAttemptCount.set(111);
    expect(getCurrentTruecallerRequestId()).toBe(
      '4ht75gduvny5nl6lv738omuyxwctw0vgttzc6hlxne9w2jjklk7iyqsmi9e9k-11'
    );
  });
});
