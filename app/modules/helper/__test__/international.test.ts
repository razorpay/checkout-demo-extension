import {
  getCustomerContactNumber,
  isCustomerWithIntlPhone,
  isInternationalCustomer,
} from 'helper/international';
import { setContact } from 'checkoutstore/screens/home';

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
    expect(getCustomerContactNumber(null as any)).toEqual('');
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
