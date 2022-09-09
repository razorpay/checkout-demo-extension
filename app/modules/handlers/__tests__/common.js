import Analytics from 'analytics';
import { setupPreferences } from 'tests/setupPreferences';

import {
  hasPaypalOptionInErrorMetadata,
  addRetryPaymentMethodOnErrorModal,
} from '../common';

jest.mock('razorpay', () => ({
  __esModule: true,
  ...jest.requireActual('razorpay'),
  isRedesignV15: jest.fn(),
  getMerchantMethods: jest.fn(() => ({ wallet: { paypal: true } })),
}));

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg) => {
    if (arg === 'amount') {
      return 100;
    }
    return arg;
  },
  getMode: () => 'test',
};

describe('Test Actions for Paypal as Backup', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', null, {
      methods: {
        wallet: {
          paypal: true,
        },
      },
    });
    Analytics.setR(razorpayInstance);
  });
  describe('Test hasPaypalOptionInErrorMetadata', () => {
    it('should return true if errorMetadata has paypal option', () => {
      const errorMetadata = {
        next: [
          {
            action: 'suggest_retry',
            instruments: [
              {
                instrument: 'paypal',
                method: 'wallet',
              },
            ],
          },
        ],
        order_id: 'test_order_id',
        payment_id: 'test_payment_id',
      };
      expect(hasPaypalOptionInErrorMetadata(errorMetadata)).toBe(true);
    });

    it('should return false if errorMetadata has no paypal option', () => {
      const errorMetadata = {
        next: [
          {
            action: 'suggest_retry',
            instruments: [],
          },
        ],
      };
      expect(hasPaypalOptionInErrorMetadata(errorMetadata)).toBe(false);
    });

    it('should return false if errorMetadata is undefined', () => {
      const errorMetadata = undefined;
      expect(hasPaypalOptionInErrorMetadata(errorMetadata)).toBe(false);
    });

    it('should return false if errorMetadata is null', () => {
      const errorMetadata = null;
      expect(hasPaypalOptionInErrorMetadata(errorMetadata)).toBe(false);
    });

    it('should return false if errorMetadata is empty object', () => {
      const errorMetadata = {};
      expect(hasPaypalOptionInErrorMetadata(errorMetadata)).toBe(false);
    });
  });

  describe('Test addRetryPaymentMethodOnErrorModal', () => {
    beforeEach(() => {
      const errorMessageContainer = document.createElement('div');
      errorMessageContainer.setAttribute('id', 'error-message');
      document.body.appendChild(errorMessageContainer);
    });
    it('should add retry payment method on error modal', () => {
      const errorMetadata = {
        next: [
          {
            action: 'suggest_retry',
            instruments: [
              {
                instrument: 'paypal',
                method: 'wallet',
              },
            ],
          },
        ],
        order_id: 'test_order_id',
        payment_id: 'test_payment_id',
      };
      addRetryPaymentMethodOnErrorModal(errorMetadata);
      expect(document.querySelector('#fd-paypal-container')).toBeTruthy();
      expect(document.querySelector('#fd-paypal')).toBeTruthy();
      expect(document.querySelector('#fd-paypal-cancel')).toBeTruthy();

      addRetryPaymentMethodOnErrorModal(null);
      expect(document.querySelector('#fd-paypal-container')).toBeFalsy();
      expect(document.querySelector('#fd-paypal')).toBeFalsy();
      expect(document.querySelector('#fd-paypal-cancel')).toBeFalsy();

      addRetryPaymentMethodOnErrorModal(errorMetadata);
      expect(document.querySelector('#fd-paypal-container')).toBeTruthy();
      expect(document.querySelector('#fd-paypal')).toBeTruthy();
      expect(document.querySelector('#fd-paypal-cancel')).toBeTruthy();
    });
  });
});
