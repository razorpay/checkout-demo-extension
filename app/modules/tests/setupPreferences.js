import RazorpayStore from 'razorpay';
import { getPreferences } from '../../../mock-api/mocks/preferences';

export const setupPreferences = (
  type = 'loggedIn',
  rInstance = {},
  preferencesOverride = {}
) => {
  const rzpInstance = {
    id: 'id',
    get: jest.fn(),
    preferences: { ...getPreferences(type), ...preferencesOverride },
    ...rInstance,
  };

  RazorpayStore.updateInstance(rzpInstance);
};

export const getCurrentCustomer = (type = 'loggedIn') => {
  return getPreferences(type).customer;
};
