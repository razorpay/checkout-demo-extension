import Analytics from 'analytics';
import { setBackdropClick } from 'checkoutstore/backdrop';
import { isRedesignV15 } from 'razorpay';
import { getSession } from 'sessionmanager';
import { setupPreferences } from 'tests/setupPreferences';
import { isVisible, updatePrimaryCTA } from 'components/ErrorModal';

import {
  hasPaypalOptionInErrorMetadata,
  addRetryPaymentMethodOnErrorModal,
  updateActionAreaContentAndCTA,
} from '../common';

jest.mock('razorpay', () => ({
  __esModule: true,
  ...jest.requireActual('razorpay'),
  isRedesignV15: jest.fn(),
  getMerchantMethods: jest.fn(() => ({ wallet: { paypal: true } })),
}));

jest.mock('components/ErrorModal', () => ({
  __esModule: true,
  ...jest.requireActual('components/ErrorModal'),
  isVisible: jest.fn(),
  updatePrimaryCTA: jest.fn(),
}));

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(() => ({
    screen: '',
  })),
}));

jest.mock('checkoutstore/backdrop', () => ({
  __esModule: true,
  ...jest.requireActual('checkoutstore/backdrop'),
  setBackdropClick: jest.fn(),
}));

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg: unknown) => {
    if (arg === 'amount') {
      return 100;
    }
    return arg;
  },
  getMode: () => 'test',
};

describe('Test Actions for Paypal as Backup', () => {
  beforeEach(() => {
    setupPreferences(
      'internationalTests',
      {},
      {
        methods: {
          wallet: {
            paypal: true,
          },
        },
      }
    );
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
      expect(hasPaypalOptionInErrorMetadata(errorMetadata as any)).toBe(false);
    });

    it('should return false if errorMetadata is null', () => {
      const errorMetadata = null;
      expect(hasPaypalOptionInErrorMetadata(errorMetadata as any)).toBe(false);
    });

    it('should return false if errorMetadata is empty object', () => {
      const errorMetadata = {};
      expect(hasPaypalOptionInErrorMetadata(errorMetadata as any)).toBe(false);
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

      addRetryPaymentMethodOnErrorModal(null as any);
      expect(document.querySelector('#fd-paypal-container')).toBeFalsy();
      expect(document.querySelector('#fd-paypal')).toBeFalsy();
      expect(document.querySelector('#fd-paypal-cancel')).toBeFalsy();

      addRetryPaymentMethodOnErrorModal(errorMetadata);
      expect(document.querySelector('#fd-paypal-container')).toBeTruthy();
      expect(document.querySelector('#fd-paypal')).toBeTruthy();
      expect(document.querySelector('#fd-paypal-cancel')).toBeTruthy();
    });

    it('should add retry payment method on error modal redesignV15', () => {
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

      (isRedesignV15 as unknown as jest.Mock).mockReturnValue(true);
      (isVisible as unknown as jest.Mock).mockReturnValue(true);
      const analytics = (Analytics.track = jest.fn());
      addRetryPaymentMethodOnErrorModal(errorMetadata);

      expect(analytics).toBeCalledTimes(3);
    });
  });

  describe('Test updateActionAreaContentAndCTA', () => {
    it('updateActionAreaContentAndCTA Redesign', () => {
      const session = getSession();
      (isVisible as unknown as jest.Mock).mockReturnValue(true);
      (isRedesignV15 as unknown as jest.Mock).mockReturnValue(true);
      updateActionAreaContentAndCTA(session, 'OK', '', true);
      expect(updatePrimaryCTA).toBeCalled();
      expect(setBackdropClick).toBeCalled();
    });

    it('updateActionAreaContentAndCTA Redesign return case', () => {
      const session = getSession();
      (isVisible as unknown as jest.Mock).mockReturnValue(false);
      (isRedesignV15 as unknown as jest.Mock).mockReturnValue(true);
      updateActionAreaContentAndCTA(session, 'OK', '', true);

      expect(setBackdropClick).toHaveBeenCalledTimes(0);
    });

    it('updateActionAreaContentAndCTA old design', () => {
      const session = getSession();
      const errorMessageContainer = document.createElement('div');
      errorMessageContainer.setAttribute('id', 'error-message');
      document.body.appendChild(errorMessageContainer);
      (isRedesignV15 as unknown as jest.Mock).mockReturnValue(false);
      updateActionAreaContentAndCTA(session, 'OK', '', true);

      expect(setBackdropClick).toBeCalled();
    });
  });
});
