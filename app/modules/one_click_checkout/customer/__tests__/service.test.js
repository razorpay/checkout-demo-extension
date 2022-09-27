import fetch from 'utils/fetch';
import { updateCustomerConsent } from '../service';

jest.mock('analytics', () => {
  const originalModule = jest.requireActual('analytics');
  return {
    ...originalModule,
    Events: {
      TrackMetric: jest.fn(),
    },
  };
});

jest.mock('utils/fetch', () => {
  const originalModule = jest.requireActual('utils/fetch');
  return {
    ...originalModule,
    post: jest.fn(),
  };
});

describe('Customer Service tests', () => {
  test('updateCustomerConsent method test', () => {
    updateCustomerConsent(true);

    expect(fetch.post.mock.calls[0][0].url).toBe(
      'https://api.razorpay.com/v1/1cc/customer/consent/marketing'
    );
    expect(fetch.post.mock.calls[0][0].data).toMatchObject({
      '1cc_customer_consent': 1,
    });
  });
});
