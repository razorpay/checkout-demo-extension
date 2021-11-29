import { setRazorpayInstance } from 'checkoutstore';
import { getPreferences } from '../../../mock-api/mocks/preferences';

export const setupPreferences = (type = 'loggedIn') => {
  setRazorpayInstance({
    get: jest.fn(),
    preferences: getPreferences(type),
  });
};

export const getCurrentCustomer = (type = 'loggedIn') => {
  return getPreferences(type).customer;
};
