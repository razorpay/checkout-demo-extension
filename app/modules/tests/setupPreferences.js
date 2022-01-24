import { setRazorpayInstance } from 'checkoutstore';
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

  // \_?_/ not sure why we are maintaining two instances of razorpay
  setRazorpayInstance(rzpInstance);
  RazorpayStore.updateInstance(rzpInstance);
};

export const getCurrentCustomer = (type = 'loggedIn') => {
  return getPreferences(type).customer;
};
