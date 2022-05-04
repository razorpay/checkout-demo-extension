import {
  definePlatform,
  enableUPITiles,
  avoidSessionSubmit,
  getGridArray,
  definePlatformReturnMethodIdentifier,
} from '../helper/upi';
import { getSDKMeta } from 'checkoutstore/native';
import { isDesktop } from 'common/useragent';
import {
  getOption,
  getPreferences,
  isRecurring,
  getMerchantMethods,
} from 'razorpay';
import feature_overrides from 'checkoutframe/overrideConfig';

import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { OTHER_INTENT_APPS, UPI_APPS } from 'upi/constants';

// jest.mock('checkoutstore/screens/upi', () => ({
//   selectedUPIAppForPay: jest.fn(),
// }));

jest.mock('../experiments', () => ({
  upiNrL0L1Improvements: {
    enabled: () => true,
  },
}));
jest.mock('checkoutstore/native', () => ({
  getSDKMeta: jest.fn(),
  getUPIIntentApps: jest.fn(),
}));
jest.mock('razorpay', () => ({
  getPreferences: jest.fn(),
  isRecurring: jest.fn(() => false),
  getOption: jest.fn(),
  getMerchantMethods: jest.fn(),
  getAmount: jest.fn(),
  getMerchantOrder: jest.fn(),
}));
jest.mock('common/useragent', () => ({
  android: true,
  iOS: true,
  isBrave: false,
  isDesktop: jest.fn(),
}));

describe('definePlatform: Utility test', () => {
  test('definePlatform; android ios', () => {
    (getSDKMeta as jest.Mock).mockReturnValueOnce({
      platform: 'android',
    });
    expect(definePlatform('androidSDK')).toBeTruthy();
    (getSDKMeta as jest.Mock).mockReturnValueOnce({
      platform: 'ios',
    });
    expect(definePlatform('iosSDK')).toBeTruthy();
  });
  test('definePlatform; mobile webs of android ios', () => {
    (getSDKMeta as jest.Mock).mockReturnValue({
      platform: 'web',
    });

    expect(definePlatform('mWebAndroid')).toBeTruthy();

    expect(definePlatform('mWebiOS')).toBeTruthy();
  });
  test('definePlatform;default', () => {
    (isDesktop as jest.Mock).mockReturnValue(true);
    expect(definePlatform('desktop')).toBeTruthy();
    expect(definePlatform('' as any)).toBeTruthy();
  });
});

describe('enableUPITiles: feature test', () => {
  afterEach(() => {
    (getPreferences as jest.Mock).mockRestore();
  });
  test("should be disabled if pref doesn't have data", () => {
    (getPreferences as jest.Mock).mockReturnValueOnce([]);
    expect(enableUPITiles()?.status).toBeFalsy();
  });
  test('should be disabled if recurring', () => {
    (getPreferences as jest.Mock).mockReturnValueOnce([]);
    (isRecurring as jest.Mock).mockReturnValueOnce(true);
    expect(enableUPITiles()?.status).toBeFalsy();
  });
  test('should be enabled if preferences available', () => {
    (getPreferences as jest.Mock).mockReturnValueOnce(
      feature_overrides.features
    );
    (isRecurring as jest.Mock).mockReturnValueOnce(false);

    expect(enableUPITiles().status).toBeTruthy();
  });
  test('should be subtext mode for desktop', () => {
    (isDesktop as jest.Mock).mockReturnValue(true);
    (getPreferences as jest.Mock).mockReturnValue(feature_overrides.features);
    expect(enableUPITiles()?.status).toBeTruthy();
    expect(enableUPITiles()?.variant).toBe('subText');
  });
  test('should be row mode for NON_DESKTOP_MODE', () => {
    (getPreferences as jest.Mock).mockReturnValue(feature_overrides.features);
    (isDesktop as jest.Mock).mockReturnValue(false);
    expect(enableUPITiles()?.status).toBeTruthy();
    expect(enableUPITiles()?.variant).toBe('row');
  });
});

describe('#avoidSessionSubmit utility test', () => {
  test('should return true if any pending callback is present', () => {
    selectedUPIAppForPay.set({
      callbackOnPay: () => {},
    });
    expect(avoidSessionSubmit()).toBe(true);
  });
  test('should return false if NO pending callback is present', () => {
    selectedUPIAppForPay.set({
      callbackOnPay: undefined,
    });
    expect(avoidSessionSubmit()).toBeFalsy();
  });
});

describe('#getGridArray utility test', () => {
  test('should return prepared grid', () => {
    let resp = getGridArray(10, new Array(6));
    expect(resp.length).toBe(1);
    expect(resp[0].length).toBe(6);

    resp = getGridArray(2, new Array(6));
    expect(resp.length).toBe(3);
    expect(resp[0].length).toBe(2);

    resp = getGridArray(4, new Array(6));
    expect(resp.length).toBe(2);
    expect(resp[0].length).toBe(4);
    expect(resp[1].length).toBe(2);

    resp = getGridArray(5, new Array(6));
    expect(resp.length).toBe(2);
    expect(resp[0].length).toBe(5);
    expect(resp[1].length).toBe(1);
  });
});

describe('#definePlatformReturnMethodIdentifier: utility test', () => {
  test('should return none for desktop', () => {
    (getOption as jest.Mock).mockReturnValue(true);
    (getMerchantMethods as jest.Mock).mockReturnValue({ upi: true });
    (isDesktop as jest.Mock).mockReturnValue(true);
    const cb = definePlatformReturnMethodIdentifier();
    expect(cb).toBeTruthy();
    expect(cb(UPI_APPS.preferred[0] as any)).toBe('none');
  });

  test('should return none for other click', () => {
    (getOption as jest.Mock).mockReturnValue(true);
    (getMerchantMethods as jest.Mock).mockReturnValue({ upi: true });
    (isDesktop as jest.Mock).mockReturnValue(true);
    const cb = definePlatformReturnMethodIdentifier();
    expect(cb).toBeTruthy();
    expect(cb(OTHER_INTENT_APPS as any)).toBe('none');
  });
});
