import { get } from 'svelte/store';
import { amount } from 'one_click_checkout/charges/store';
import {
  appliedGiftCards,
  updatedGiftCards,
} from 'one_click_checkout/gift_card/store';
import { resetBalanceGCAmt } from 'one_click_checkout/gift_card/helpers';
import { setupPreferences } from 'tests/setupPreferences';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

const appliedGC = [
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
  {
    giftCardNumber: '566999',
    giftCardValue: 30000, // actual gift card value ₹300
    appliedAmt: 10000, // applied gift card amount ₹100
    balanceAmt: 20000, // balance gift card amount ₹200
  },
];

describe('Reset Balance Gift Card Amount', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': { configs: { one_cc_gift_card: true } },
    });
  });
  it('should remove the applied Gift Card, if total order value is decreased', async () => {
    appliedGiftCards.set(appliedGC);
    amount.set(-10000); // ₹100
    resetBalanceGCAmt();
    expect(get(amount)).toBe(100); // ₹1
    expect(get(updatedGiftCards)).toHaveLength(2);
  });
  it('should reset the amount to applied Gift Card, if total order value is decreased', async () => {
    appliedGiftCards.set(appliedGC);
    amount.set(-5000); // ₹50
    resetBalanceGCAmt();
    expect(
      get(appliedGiftCards)[get(appliedGiftCards).length - 1].appliedAmt
    ).toBe(4900); // ₹49
    expect(
      get(appliedGiftCards)[get(appliedGiftCards).length - 1].balanceAmt
    ).toBe(25100); // ₹251
    expect(get(amount)).toBe(100); // ₹1
    expect(get(appliedGiftCards)).toHaveLength(3);
  });
});
