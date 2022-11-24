import { createShopifyCheckoutId } from '..';
import { getShopifyCheckoutId } from '../controller';

jest.mock('checkoutframe/1cc-shopify', () => {
  const originalModule = jest.requireActual('checkoutframe/1cc-shopify');
  return {
    ...originalModule,
    createShopifyCheckoutId: jest.fn(),
  };
});

const MOCK_BODY = {
  token: '94790dd7b54698d7377378a7ce5d78ce',
  total_price: 40000,
  items: [
    {
      id: 41989318508711,
      properties: {
        testKey1: 'hello',
        testKey2: 2,
      },
      quantity: 1,
      variant_id: 41989318312103,
      total_discount: 0,
      discounts: [
        {
          amount: 200,
          tittle: 'test_discount',
        },
      ],
      requires_shipping: true,
      line_level_discount_allocations: [
        {
          discount_application: {
            type: 'script',
          },
        },
      ],
    },
  ],
};

describe('Shopify Controller tests', () => {
  describe('getShopifyCheckoutId tests: Returns shopify checkout ID', () => {
    it("should call service method if promise doesn't exist", async () => {
      createShopifyCheckoutId.mockResolvedValue({
        shopify_checkout_id: 'checkout_100000',
      });

      const promise = getShopifyCheckoutId({
        body: MOCK_BODY,
        key_id: 'rzp_test_1000',
      });

      expect(createShopifyCheckoutId).toHaveBeenCalled();
      expect(promise).resolves.toBe('checkout_100000');
    });
  });
});
