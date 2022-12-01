import { get } from 'svelte/store';
import {
  appliedGiftCards,
  optimisedGiftCards,
} from 'one_click_checkout/gift_card/store';
import { optimiseGCApply } from 'one_click_checkout/gift_card/helpers';
import { setupPreferences } from 'tests/setupPreferences';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const prevAppliedGC = [
  {
    giftCardNumber: '566556',
    giftCardValue: 10000, // actual gift card value ₹100
    appliedAmt: 10000, // applied gift card amount ₹100
    balanceAmt: 0, // balance gift card amount ₹0
  },
  {
    giftCardNumber: '566777',
    giftCardValue: 10000, // actual gift card value ₹100
    appliedAmt: 10000, // applied gift card amount ₹100
    balanceAmt: 0, // balance gift card amount ₹0
  },
];

describe('Optimise gift card applied', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': {
        configs: { one_cc_gift_card: true, one_cc_multiple_gift_card: true },
      },
    });
  });
  it('should remove applied GC, if last applied GC balance is greater that the previously applied GC', async () => {
    appliedGiftCards.set([
      ...prevAppliedGC,
      {
        giftCardNumber: '566999',
        giftCardValue: 35000, // actual gift card value ₹350
        appliedAmt: 10000, // applied gift card amount ₹100
        balanceAmt: 25000, // balance gift card amount ₹200
      },
    ]);
    optimiseGCApply();
    expect(get(optimisedGiftCards)).toHaveLength(1);
    expect(get(optimisedGiftCards)[0].appliedAmt).toBe(30000);
    expect(get(optimisedGiftCards)[0].balanceAmt).toBe(5000);
  });
  it('should not remove applied GC, if last applied GC balance is less that the previously applied GC', async () => {
    appliedGiftCards.set([
      ...prevAppliedGC,
      {
        giftCardNumber: '566999',
        giftCardValue: 15000, // actual gift card value ₹150
        appliedAmt: 10000, // applied gift card amount ₹100
        balanceAmt: 5000, // balance gift card amount ₹50
      },
    ]);
    optimiseGCApply();
    expect(get(optimisedGiftCards)).toHaveLength(3);
  });
  it('should not remove applied GC, if last applied GC has zero balance', async () => {
    appliedGiftCards.set([
      ...prevAppliedGC,
      {
        giftCardNumber: '566999',
        giftCardValue: 15000, // actual gift card value ₹150
        appliedAmt: 10000, // applied gift card amount ₹100
        balanceAmt: 0, // balance gift card amount ₹0
      },
    ]);
    optimiseGCApply();
    expect(get(optimisedGiftCards)).toHaveLength(3);
  });
});
