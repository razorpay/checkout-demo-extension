import { get } from 'svelte/store';
import {
  contact as customerContact,
  getCustomerCountryISOCode,
} from 'checkoutstore/screens/home';
import { INDIA_COUNTRY_ISO_CODE } from 'common/constants';

export const getCustomerContactNumber = (contact?: string) =>
  contact || get(customerContact);

export const isCustomerWithIntlPhone = (countryCode?: string) =>
  countryCode && countryCode !== INDIA_COUNTRY_ISO_CODE;

export const isInternationalCustomer = () =>
  isCustomerWithIntlPhone(getCustomerCountryISOCode());
