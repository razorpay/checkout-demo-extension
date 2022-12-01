import { get } from 'svelte/store';
import { amount } from 'one_click_checkout/charges/store';
import { appliedGiftCards } from 'one_click_checkout/gift_card/store';
import {
  applyBalanceGCAmt,
  getSelectedGCAmt,
} from 'one_click_checkout/gift_card/helpers';
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
    giftCardValue: 5000, // actual gift card value ₹50
    appliedAmt: 4000, // applied gift card amount ₹40
    balanceAmt: 1000, // balance gift card amount ₹10
  },
];

describe('Apply balance Gift Card amount', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': { configs: { one_cc_gift_card: true } },
    });
  });
  it('Apply available balance from the applied Gift card, if total order value is increased', async () => {
    appliedGiftCards.set(appliedGC);
    amount.set(500); // ₹5
    applyBalanceGCAmt();
    expect(get(amount)).toBe(100); // amount after applying the balance GC amount ₹1
  });
});
describe('Get Selected Gift Card Amount', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': { configs: { one_cc_gift_card: true } },
    });
  });
  it('should return gift card amount for selected gift card number', async () => {
    const { giftCardNumber, giftCardValue } = appliedGC[0];
    appliedGiftCards.set(appliedGC);
    getSelectedGCAmt(giftCardNumber);
    expect(getSelectedGCAmt(giftCardNumber)).toBe(giftCardValue);
  });
});
