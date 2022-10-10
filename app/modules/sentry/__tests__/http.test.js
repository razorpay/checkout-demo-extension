import { isUrlApplicableForErrorTracking } from 'error-service';
import { captureError } from 'sentry/http';
import { getPreferences, isOneClickCheckout } from 'razorpay';
import { preferences } from './fixtures/preferences';
import fetch from 'utils/fetch';

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(),
}));

jest.mock('razorpay', () => ({
  isOneClickCheckout: jest.fn(),
  getPreferences: jest.fn(),
}));

jest.mock('sentry/context', () => ({
  getContext: () => ({
    options: {
      order_id: 'order_test',
      callback_url: 'https://mock-callback.razorpay.com/callback',
      redirect: true,
    },
    checkout_id: 'mock_checkout',
    order_id: 'order_test',
    logged_in: false,
    one_click_checkout: true,
    has_saved_address: false,
    has_saved_cards: false,
  }),
}));

jest.mock('utils/fetch', () => ({
  post: jest.fn(),
}));

const ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://checkout-static.razorpay.com',
];

describe('isUrlApplicableForTracking: evaluates if error should be captured or not', () => {
  ERROR_TRACKING_URLS.forEach((url) => {
    it(`${url} should return true`, () => {
      const applicable = isUrlApplicableForErrorTracking(
        `${url}/v1/checkout-frame.js`
      );

      expect(applicable).toBeTruthy();
    });
  });

  it(`localhost:8000 should be ignored`, () => {
    const applicable = isUrlApplicableForErrorTracking(
      `http://localhost:8000/v1/checkout-frame.js`
    );

    expect(applicable).toBeFalsy();
  });
});

describe('captureError: pushes error to sentry store endpoint', () => {
  it('should make api call', () => {
    const error = new Error('Something went wrong');

    window.Sentry = null;
    isOneClickCheckout.mockReturnValue(false);

    captureError(error);

    expect(fetch.post).toHaveBeenCalled();
  });

  it('should not make api call if sentry already injected', () => {
    window.Sentry = { init: jest.fn() };
    const error = new Error('Something went wrong');

    isOneClickCheckout.mockReturnValue(true);

    captureError(error);

    expect(fetch.post).not.toHaveBeenCalled();
  });

  it('should make api call if not one click checkout', () => {
    window.Sentry = null;
    const error = new Error('Something went wrong');

    isOneClickCheckout.mockReturnValue(false);

    captureError(error);

    expect(fetch.post).toHaveBeenCalled();
  });
});
