import { setupPreferences } from 'tests/setupPreferences';

import {
  INTERNATIONAL_APPS,
  isInternationalProvider,
  isDCCEnabledForProvider,
  getInternationalAppsConfig,
  getInternationalProviderName,
  updateInternationalProviders,
  isMerchantInternationalAppEnabled,
  isMerchantInternationalMethodEnabled,
  isInternationalInPreferredInstrument,
} from '../international';

describe('Test getInternationalAppsConfig', () => {
  test('should return config for international apps', () => {
    const apps = Object.values(INTERNATIONAL_APPS);
    const config = getInternationalAppsConfig();
    apps.forEach((app) => {
      expect(config[app]).toBeDefined();
    });
  });
});

describe('Test isInternationalProvider', () => {
  test('should return true if app is international', () => {
    const apps = Object.values(INTERNATIONAL_APPS);
    apps.forEach((app) => {
      expect(isInternationalProvider(app)).toBe(true);
    });
    expect(isInternationalProvider('paypal')).toBe(false);
  });
});

describe('Test isDCCEnabledForProvider', () => {
  test('should return true if app has DCC enabled', () => {
    const apps = Object.values(INTERNATIONAL_APPS);
    apps.forEach((app) => {
      expect(isDCCEnabledForProvider(app)).toBe(true);
    });
    expect(isDCCEnabledForProvider('paypal')).toBe(true);
    expect(isDCCEnabledForProvider('cred')).toBe(false);
  });
});

describe('Test isInternationalInPreferredInstrument', () => {
  test('should return true if preferred instrument is international', () => {
    expect(
      isInternationalInPreferredInstrument({
        method: 'international',
        providers: ['trustly', 'poli', 'sofort', 'giropay'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['poli'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['trustly'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['sofort'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['giropay'],
      })
    ).toStrictEqual(true);
  });

  test('should return false if preferred instrument is not international', () => {
    expect(
      isInternationalInPreferredInstrument({
        method: 'wallet',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual(false);
    expect(
      isInternationalInPreferredInstrument({
        method: 'card',
        providers: [],
      })
    ).toStrictEqual(false);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['cred'],
      })
    ).toStrictEqual(false);
  });
});

describe('Test getInternationalProviderName', () => {
  test('should return correct provider name', () => {
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual('trustly');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['poli', 'trustly'],
      })
    ).toStrictEqual('poli');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['sofort', 'giropay'],
      })
    ).toStrictEqual('sofort');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['giropay'],
      })
    ).toStrictEqual('giropay');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: [],
      })
    ).toStrictEqual(undefined);
  });
});

describe('Test updateInternationalProviders', () => {
  test('should update instrument method to international', () => {
    expect(
      updateInternationalProviders([
        {
          method: 'app',
          providers: ['trustly'],
        },
        {
          method: 'app',
          providers: ['poli'],
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
        providers: ['trustly'],
      },
      {
        method: 'international',
        providers: ['poli'],
      },
    ]);
    expect(
      updateInternationalProviders([
        {
          method: 'app',
          providers: ['poli'],
        },
        {
          method: 'card',
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
        providers: ['poli'],
      },
      {
        method: 'card',
      },
    ]);
  });
  test('should not update instrument method to international', () => {
    expect(
      updateInternationalProviders([
        {
          method: 'international',
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
      },
    ]);
    expect(
      updateInternationalProviders([
        {
          method: 'card',
        },
      ])
    ).toStrictEqual([
      {
        method: 'card',
      },
    ]);
  });
});

describe('Test isMerchantInternationalMethodEnabled', () => {
  test('Should return true if trustly is enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          trustly: 1,
        },
      },
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(true);
  });
  test('Should return true if poli is enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          poli: 1,
        },
      },
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(true);
  });
  test('Should return true if sofort is enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          sofort: 1,
        },
      },
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(true);
  });
  test('Should return true if giropay is enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          giropay: 1,
        },
      },
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(true);
  });
  test('Should return false if apps are not enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {},
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(false);
  });
  test('Should return false if domestic apps are enabled in preferences', () => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          cred: 1,
        },
      },
    });
    expect(isMerchantInternationalMethodEnabled()).toBe(false);
  });
});

describe('Test isMerchantInternationalAppEnabled', () => {
  beforeAll(() => {
    setupPreferences('loggedIn', null, {
      methods: {
        app: {
          trustly: 1,
          poli: 1,
          sofort: 1,
          giropay: 1,
        },
      },
    });
  });

  test('Should return true if trustly is enabled in preferences', () => {
    expect(isMerchantInternationalAppEnabled('trustly')).toBe(true);
  });
  test('Should return true if poli is enabled in preferences', () => {
    expect(isMerchantInternationalAppEnabled('poli')).toBe(true);
  });
  test('Should return true if sofort is enabled in preferences', () => {
    expect(isMerchantInternationalAppEnabled('sofort')).toBe(true);
  });
  test('Should return true if giropay is enabled in preferences', () => {
    expect(isMerchantInternationalAppEnabled('giropay')).toBe(true);
  });
});
