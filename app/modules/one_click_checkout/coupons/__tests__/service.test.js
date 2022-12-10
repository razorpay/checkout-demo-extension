import fetch from 'utils/fetch';
import * as service from 'one_click_checkout/coupons/service';
import cache from 'one_click_checkout/coupons/service/cache';
import { getContactPayload } from 'one_click_checkout/store';
import { getShopifyCheckoutPromise } from 'checkoutframe/1cc-shopify';

import { setupPreferences } from 'tests/setupPreferences';
import { getOrderId } from 'razorpay/helper/order';

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

jest.mock('razorpay/helper/order', () => {
  return {
    getOrderId: jest.fn(),
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

jest.mock('utils/fetch', () => {
  return {
    __esModule: true,
    default: jest.fn(({ callback }) => {
      callback({ promotions: [] });
    }),
  };
});

jest.mock('checkoutframe/1cc-shopify', () => {
  return {
    getShopifyCheckoutPromise: jest.fn(),
  };
});

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
    fetch.mockImplementation(({ callback }) =>
      callback({ promotions: COUPONS_LIST })
    );
    getOrderId.mockReturnValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(fetch).toHaveBeenCalled();
    expect(promotions).toBe(COUPONS_LIST);
  });

  test("shouldn't make api calls if cache exists", async () => {
    setupPreferences('one_click_checkout');

    getContactPayload.mockReturnValue({});
    cache.getCache.mockReturnValue(COUPONS_LIST);
    getOrderId.mockReturnValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(promotions).toBe(COUPONS_LIST);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should have contact/email in payload if passed', async () => {
    setupPreferences('one_click_checkout');

    getContactPayload.mockReturnValue({
      email: 'test@razorpay.com',
      contact: '+91999999999',
    });
    cache.getCache.mockReturnValue(null);
    getOrderId.mockReturnValue('order_test_id');

    const promotions = await service.getCoupons();

    expect(promotions).toBe(COUPONS_LIST);

    const args = fetch.mock.calls[0][0];
    expect(args.url).toContain('contact=%2B91999999999');
    expect(args.url).toContain('email=test%40razorpay.com');
  });

  test('send shopify checkout id if present', async () => {
    setupPreferences('one_click_checkout');

    getContactPayload.mockReturnValue({});
    getShopifyCheckoutPromise.mockResolvedValue('checkout_id');
    cache.getCache.mockReturnValue(null);

    await service.getCoupons();

    const args = fetch.mock.calls[0][0];
    expect(args.url).toContain('reference_id=checkout_id');
    expect(args.url).toContain('reference_type=shopify');
    expect(args.url).not.toContain('order');
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
