import fetch from 'utils/fetch';
import * as service from 'one_click_checkout/coupons/service';
import cache from 'one_click_checkout/coupons/service/cache';
import { getContactPayload } from 'one_click_checkout/store';

import { setupPreferences } from 'tests/setupPreferences';
import { getLazyOrderId } from 'one_click_checkout/order/controller';

const COUPONS_LIST = [
  {
    code: 'OFFERAUG',
    summary: 'short summary',
    description: 'long description - One time ',
    tnc: ['dagdasga', 'sahhqw'],
  },
  {
    code: 'OFFERSPL',
    summary: 'short summary',
    description: 'long description - Two time ',
    tnc: ['dagdasga', 'sahhqw'],
  },
];

jest.mock('one_click_checkout/order/controller', () => {
  const original = jest.requireActual('one_click_checkout/order/controller');

  return {
    ...original,
    getLazyOrderId: jest.fn(),
  };
});

jest.mock('one_click_checkout/coupons/service/cache', () => {
  const original = jest.requireActual(
    'one_click_checkout/coupons/service/cache'
  );

  return {
    ...original,
    setCache: jest.fn(),
    getCache: jest.fn(),
  };
});
jest.mock('utils/fetch', () => ({
  post: jest.fn(({ callback }) => {
    callback({ promotions: [] });
  }),
}));
jest.mock('analytics');
jest.mock('one_click_checkout/store', () => {
  const original = jest.requireActual('one_click_checkout/store');

  return {
    ...original,
    getContactPayload: jest.fn(),
  };
});

describe('get coupons service call', () => {
  test('should make api calls if cache does not exist', async () => {
    setupPreferences('one_click_checkout');

    cache.getCache.mockReturnValue(null);
    getContactPayload.mockReturnValue({});
    fetch.post.mockImplementation(({ callback }) =>
      callback({ promotions: COUPONS_LIST })
    );
    getLazyOrderId.mockResolvedValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(fetch.post).toHaveBeenCalled();
    expect(promotions).toBe(COUPONS_LIST);
  });

  test("shouldn't make api calls if cache exists", async () => {
    setupPreferences('one_click_checkout');

    getContactPayload.mockReturnValue({});
    cache.getCache.mockReturnValue(COUPONS_LIST);
    getLazyOrderId.mockResolvedValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(promotions).toBe(COUPONS_LIST);
    expect(fetch.post).not.toHaveBeenCalled();
  });

  test('should have contact/email in payload if passed', async () => {
    setupPreferences('one_click_checkout');

    getContactPayload.mockReturnValue({
      email: 'test@razorpay.com',
      contact: '+91999999999',
    });
    cache.getCache.mockReturnValue(null);
    getLazyOrderId.mockResolvedValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(promotions).toBe(COUPONS_LIST);

    const args = fetch.post.mock.calls[0][0];
    expect(args.data.contact).toBe('+91999999999');
    expect(args.data.email).toBe('test@razorpay.com');
  });

  // test('should reject if promotions is not returned', async () => {
  //   setupPreferences('one_click_checkout');

  //   cache.getCache.mockReturnValue(null);
  //   getContactPayload.mockReturnValue({});
  //   fetch.post.mockImplementation(({ callback }) =>
  //     callback({ error: 'not found' })
  //   );

  //   const promise = service.getCoupons();

  //   expect(fetch.post).toHaveBeenCalled();
  //   expect(promise).rejects.toEqual({ error: 'not found' });
  // });
});
