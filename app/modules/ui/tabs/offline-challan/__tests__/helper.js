import { setupPreferences } from 'tests/setupPreferences';
import { getSession } from 'sessionmanager';
import Analytics from 'analytics';

// testable module
import { createVirtualAccount, copyDetailsToClipboard } from '../helper';

jest.useFakeTimers();

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  customer_id: 'customer_id',
  get: (arg) => arg,
  getMode: () => 'test',
};

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: razorpayInstance,
    }),
  };
});

global.fetch = {
  post: jest.fn((options) => {
    return new Promise((resolve) => {
      let response = {
        name: 'virtual accounts',
      };
      options.callback(response);
      resolve(response);
    });
  }),
};

describe('Test createVirtualAccount', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
    setupPreferences('loggedIn', razorpayInstance);
  });

  test('Should create virtual account', async () => {
    const session = getSession();
    createVirtualAccount(session, 'test_orderId').then((response) => {
      expect(response).toStrictEqual({
        name: 'virtual accounts',
      });
      expect(fetch.post).toHaveBeenCalledTimes(1);
      expect(fetch.post).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: { customer_id: 'customer_id', receivers: ['offline_challan'] },
          url: 'https://api.razorpay.com/v1/orders/test_orderId/virtual_accounts?key_id=key&account_id=account_id',
        })
      );
    });
  });
});

describe('Test copyDetailsToClipboard', () => {
  test('Should copy text to clipboard', async () => {
    document.execCommand = jest.fn();
    const selector = 'body';
    const text = 'copy this text to clipboard';
    expect(copyDetailsToClipboard(selector, text)).toHaveProperty('then');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
