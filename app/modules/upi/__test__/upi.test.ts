import {
  definePlatform,
  avoidSessionSubmit,
  getGridArray,
  definePlatformReturnMethodIdentifier,
  isNativeIntentAvailable,
} from '../helper/upi';
import { enableUPITiles } from 'upi/features';
import { getSDKMeta, getUPIIntentApps } from 'checkoutstore/native';
import { isUPIFlowEnabled } from 'checkoutstore/methods';
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
jest.mock('checkoutstore/methods', () => ({
  isUPIFlowEnabled: jest.fn(() => true),
}));
jest.mock('checkoutstore/native', () => ({
  getSDKMeta: jest.fn(() => ({
    platform: '',
  })),
  getUPIIntentApps: jest.fn(),
}));
jest.mock('razorpay', () => ({
  getCurrency: () => 'INR',
  getPreferences: jest.fn(),
  isRecurring: jest.fn(() => false),
  getOption: jest.fn(),
  getMerchantMethods: jest.fn(),
  getAmount: jest.fn(),
  getMerchantOrder: jest.fn(),
  getMerchantKey: jest.fn(() => 'rzp_live_ILgsfZCZoFIKMb'),
  isOneClickCheckout: jest.fn(),
}));
jest.mock('common/useragent', () => ({
  android: true,
  iOS: false,
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

    /**
     * Above we are mocking modules and user agents.
     * please check if tests failing
     */

    expect(definePlatform('mWebAndroid')).toBeTruthy();

    expect(definePlatform('mWebiOS')).toBeFalsy();
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
    (isRecurring as jest.Mock).mockRestore();
  });
  test("should be disabled if pref doesn't have data", () => {
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce([]);
    expect(enableUPITiles()?.status).toBeFalsy();
  });
  test('should be disabled if recurring', () => {
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce([]);
    (isRecurring as jest.Mock).mockReturnValueOnce(true);
    expect(enableUPITiles()?.status).toBeFalsy();
  });

  test('should be disabled if upi_intent disable', () => {
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce([]);
    (isRecurring as jest.Mock).mockReturnValueOnce(true);
    expect(enableUPITiles()?.status).toBeFalsy();
  });

  test('should be enabled if preferences available', () => {
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(feature_overrides.features);
    (isRecurring as jest.Mock).mockReturnValueOnce(false);
    const response = enableUPITiles();
    expect(response.status).toBeTruthy();
  });

  test('should be subtext mode for desktop', () => {
    (isDesktop as jest.Mock).mockReturnValue(true);
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(feature_overrides.features);
    const response = enableUPITiles();
    expect(response?.status).toBeTruthy();
    expect(response?.variant).toBe('subText');
  });
  test('should be row mode for NON_DESKTOP_MODE', () => {
    (getPreferences as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(feature_overrides.features);
    (isDesktop as jest.Mock).mockReturnValue(false);
    const response = enableUPITiles();
    expect(response?.status).toBeTruthy();
    expect(response?.variant).toBe('row');
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
    (getOption as jest.Mock).mockReturnValueOnce(true);
    (getMerchantMethods as jest.Mock).mockReturnValueOnce({ upi: true });
    (isDesktop as jest.Mock).mockReturnValueOnce(true);
    (isUPIFlowEnabled as jest.Mock).mockReturnValueOnce(false);
    const cb = definePlatformReturnMethodIdentifier();
    expect(cb).toBeTruthy();
    expect(cb(UPI_APPS.preferred[0] as any)).toBe('none');
  });

  test('should return nativeIntent for android SDK', () => {
    (getSDKMeta as jest.Mock).mockReturnValueOnce({
      platform: 'android',
    });
    (getUPIIntentApps as jest.Mock).mockReturnValue({
      filtered: [
        {
          package_name: 'com.google.android.apps.nbu.paisa.user',
        },
      ],
    });
    (getOption as jest.Mock).mockReturnValueOnce(true);
    (getMerchantMethods as jest.Mock).mockReturnValueOnce({ upi: true });
    (isUPIFlowEnabled as jest.Mock).mockReturnValueOnce(true);
    const cb = definePlatformReturnMethodIdentifier();
    expect(cb).toBeTruthy();
    expect(cb(UPI_APPS.preferred[0] as any)).toBe('nativeIntent');
  });

  test('should return none for other click', () => {
    (getOption as jest.Mock).mockReturnValueOnce(true);
    (getMerchantMethods as jest.Mock).mockReturnValueOnce({ upi: true });
    (isDesktop as jest.Mock).mockReturnValueOnce(true);
    const cb = definePlatformReturnMethodIdentifier();
    expect(cb).toBeTruthy();
    expect(cb(OTHER_INTENT_APPS as any)).toBe('none');
  });
});

describe('#isNativeIntentAvailable', () => {
  test('isNativeIntentAvailable -ve case', () => {
    (getUPIIntentApps as jest.Mock).mockReturnValue({
      filtered: [],
    });
    expect(isNativeIntentAvailable('com.phonepe.app')).toBeFalsy();
  });
  test('isNativeIntentAvailable +ve case', () => {
    (getUPIIntentApps as jest.Mock).mockReturnValue({
      filtered: [
        {
          package_name: 'com.phonepe.app',
        },
      ],
    });
    expect(isNativeIntentAvailable('com.phonepe.app')).toBeTruthy();
  });
});
