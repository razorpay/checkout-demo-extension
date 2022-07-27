import { getInternationalProviders, isMethodEnabled } from '../methods';
import {
  hiddenMethods,
  hiddenInstruments,
  setContact,
  getCustomerCountryISOCode,
} from 'checkoutstore/screens/home';

import { INDIA_COUNTRY_ISO_CODE, US_COUNTRY_ISO_CODE } from 'common/constants';

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

describe('Test getCustomerCountryISOCode', () => {
  test('Should return US country code if customer has US phone number', () => {
    setContact('+14433226677');
    expect(getCustomerCountryISOCode()).toBe(US_COUNTRY_ISO_CODE);
    setContact('(541) 754-3010');
    expect(getCustomerCountryISOCode()).toBe(US_COUNTRY_ISO_CODE);
    setContact('(123)');
    expect(getCustomerCountryISOCode()).toBe(US_COUNTRY_ISO_CODE);
    setContact('1-541-754-3010');
    expect(getCustomerCountryISOCode()).toBe(US_COUNTRY_ISO_CODE);
  });
  test('Should return UK country code if customer has UK phone number', () => {
    setContact('+44433226677');
    expect(getCustomerCountryISOCode()).toBe('GB');
    setContact('44433226677');
    expect(getCustomerCountryISOCode()).toBe('GB');
    setContact('44-442-754-3010');
    expect(getCustomerCountryISOCode()).toBe('GB');
  });
  test('Should return IN country code for contact is empty', () => {
    setContact('');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('+');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
  });
  test('Should return default country code if customer enters invalid phone number', () => {
    setContact('++++++');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('-----');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('US');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
  });
  test('Should return IN country code if customer has indian phone number', () => {
    setContact('+918888888888');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('918888888888');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('08888888888');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
    setContact('8888888888');
    expect(getCustomerCountryISOCode()).toBe(INDIA_COUNTRY_ISO_CODE);
  });
});
