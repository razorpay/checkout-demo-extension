import type { Writable } from 'svelte/store';
import { setupPreferences } from 'tests/setupPreferences';
import { restrictBuyGCViaGC } from 'one_click_checkout/gift_card/helpers';
import { cartItems } from 'one_click_checkout/cart/store';
import type { cartItemType } from 'one_click_checkout/gift_card/types/giftcard';
import { GIFT_CARD_TYPE } from 'one_click_checkout/gift_card/constants';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const cartItemValWithoutGC: cartItemType = [
  {
    name: 'boAt Airdopes 121 v2 with 8mm driver, LED Case Battery Indicator, 380mAh Pocket Friendly Charging Case',
    price: 129900,
    quantity: 1,
    image_url:
      'https://cdn.shopify.com/s/files/1/0057/8938/4802/products/airdopes-121-v2-black.png?v=1655366250',
    variant_id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMjAxNDUwMzE0OTY2Ng==',
    description:
      'boAt Airdopes 121 v2 - Best Wireless Earbuds Plug into your sound with boAt Airdopes 121v2',
  },
  {
    name: 'boAt Airdopes 121 v2 with 8mm driver, LED Case Battery Indicator, 380mAh Pocket Friendly Charging Case',
    price: 129900,
    quantity: 2,
    image_url:
      'https://cdn.shopify.com/s/files/1/0057/8938/4802/products/airdopes-121-v2-blue.png?v=1655366250',
    variant_id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMjAxNDUwMzE4MjQzNA==',
    description:
      'boAt Airdopes 121 v2 - Best Wireless Earbuds Plug into your sound with boAt Airdopes 121v2',
  },
];
const cartItemValWithGC = [...cartItemValWithoutGC].map((item) => ({
  ...item,
  type: GIFT_CARD_TYPE,
}));
const restBuyGCViaGCVal = [
  { restBuyGCViaGC: true, cartItemVal: cartItemValWithGC, expValue: true },
  { restBuyGCViaGC: true, cartItemVal: cartItemValWithoutGC, expValue: false },
  { restBuyGCViaGC: false, cartItemVal: cartItemValWithGC, expValue: false },
  { restBuyGCViaGC: false, cartItemVal: cartItemValWithoutGC, expValue: false },
];
describe('Restrict Buy Gift card via Gift card', () => {
  test.each(restBuyGCViaGCVal)(
    'given restBuyGCViaGC & cartItemVal, returns expValue',
    ({ restBuyGCViaGC, cartItemVal, expValue }) => {
      setupPreferences('loggedIn', razorpayInstance, {
        '1cc': {
          configs: {
            one_cc_gift_card: true,
            one_cc_buy_gift_card: restBuyGCViaGC,
          },
        },
      });
      (cartItems as Writable<cartItemType>).set(cartItemVal);
      expect(restrictBuyGCViaGC()).toBe(expValue);
    }
  );
});
