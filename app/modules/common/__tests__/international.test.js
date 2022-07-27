import { setupPreferences } from 'tests/setupPreferences';

import { phone, setContact } from 'checkoutstore/screens/home';

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
  isCustomerWithIntlPhone,
  getCustomerContactNumber,
  isInternationalCustomer,
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

describe('Test isCustomerWithIntlPhone', () => {
  test('Should return false if countryCode is IN', () => {
    expect(isCustomerWithIntlPhone('IN')).toBe(false);
  });
  test('Should return true if countryCode is US', () => {
    expect(isCustomerWithIntlPhone('US')).toBe(true);
  });
  test('Should return falsy value if countryCode is undefined', () => {
    expect(isCustomerWithIntlPhone()).toBeFalsy();
  });
});

describe('Test getCustomerPhoneNumberWithCode', () => {
  test('Should return customer contact if passed in argument', () => {
    expect(getCustomerContactNumber('8888888888')).toEqual('8888888888');
  });
  test('Should not return customer contact', () => {
    setContact('');
    expect(getCustomerContactNumber()).toEqual('');
  });
  test('Should return IN customer contact from store', () => {
    setContact('9999999999');
    expect(getCustomerContactNumber()).toEqual('+919999999999');
    setContact('09999999999');
    expect(getCustomerContactNumber()).toEqual('+919999999999');
    setContact('+919999999999');
    expect(getCustomerContactNumber()).toEqual('+919999999999');
    setContact('+9999999999');
    expect(getCustomerContactNumber()).toEqual('+919999999999');
  });
  test('Should return US customer contact from store', () => {
    setContact('(541) 754-3010');
    expect(getCustomerContactNumber()).toEqual('+15417543010');
  });
  test('Should return UK customer contact from store', () => {
    setContact('44433226677');
    expect(getCustomerContactNumber()).toEqual('+44433226677');
    setContact('+44433226677');
    expect(getCustomerContactNumber()).toEqual('+44433226677');
  });
  test('Should return blank for invalid contact from store', () => {
    setContact('+');
    expect(getCustomerContactNumber()).toEqual('');
    setContact('+-');
    expect(getCustomerContactNumber()).toEqual('');
    setContact('-----');
    expect(getCustomerContactNumber()).toEqual('');
    setContact('0000');
    expect(getCustomerContactNumber(null)).toEqual('');
  });
});

describe('Test isInternationalCustomer', () => {
  test('Should return true if customer has US phone number', () => {
    setContact('+14433226677');
    expect(isInternationalCustomer()).toBe(true);
    setContact('(541) 754-3010');
    expect(isInternationalCustomer()).toBe(true);
    setContact('(123)');
    expect(isInternationalCustomer()).toBe(true);
    setContact('1-541-754-3010');
    expect(isInternationalCustomer()).toBe(true);
  });
  test('Should return true if customer has UK phone number', () => {
    setContact('+44433226677');
    expect(isInternationalCustomer()).toBe(true);
    setContact('44433226677');
    expect(isInternationalCustomer()).toBe(true);
    setContact('44-442-754-3010');
    expect(isInternationalCustomer()).toBe(true);
  });
  test('Should return false for contact is empty', () => {
    setContact('');
    expect(isInternationalCustomer()).toBe(false);
    setContact('+');
    expect(isInternationalCustomer()).toBe(false);
  });
  test('Should return false if customer enters invalid phone number', () => {
    setContact('++++++');
    expect(isInternationalCustomer()).toBe(false);
    setContact('-----');
    expect(isInternationalCustomer()).toBe(false);
    setContact('US');
    expect(isInternationalCustomer()).toBe(false);
  });
  test('Should return false if customer has indian phone number', () => {
    setContact('+918888888888');
    expect(isInternationalCustomer()).toBe(false);
    setContact('918888888888');
    expect(isInternationalCustomer()).toBe(false);
    setContact('08888888888');
    expect(isInternationalCustomer()).toBe(false);
    setContact('8888888888');
    expect(isInternationalCustomer()).toBe(false);
  });
});
