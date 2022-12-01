import { amount } from 'one_click_checkout/charges/store';
import {
  getAppliedGCAmt,
  getErrorMessageLabel,
} from 'one_click_checkout/gift_card/helpers';
import { checkPatternMatching } from 'one_click_checkout/common/utils';
import { INVALID_GIFT_CARD_NUMBER } from 'one_click_checkout/gift_card/i18n/labels';
import {
  GC_NUMBER,
  MIN_AMOUNT,
  GC_NUMBER_REGEX_PATTERN,
} from 'one_click_checkout/gift_card/constants';

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

describe('Applied Gift Card Amount', () => {
  it('If Gift Card amount is greater than the Total amount', async () => {
    const totalAmount = 10000; // ₹100
    const giftCardAmount = 20000; // ₹200
    const expectedGCApplied = totalAmount - MIN_AMOUNT; // ₹100 - ₹1
    amount.set(totalAmount);
    expect(getAppliedGCAmt(giftCardAmount)).toBe(expectedGCApplied);
  });
  it('If Gift Card amount is equal to Total amount', async () => {
    const totalAmount = 20000; // ₹200
    const giftCardAmount = 20000; // ₹100
    const expectedGCApplied = totalAmount - MIN_AMOUNT; // ₹100 - ₹1
    amount.set(totalAmount);
    expect(getAppliedGCAmt(giftCardAmount)).toBe(expectedGCApplied);
  });
  it('If Gift Card amount is less than the Total amount', async () => {
    const totalAmount = 20000; // ₹200
    const giftCardAmount = 10000; // ₹100
    const expectedGCApplied = giftCardAmount; // ₹100 complete Gift card amount applied
    amount.set(totalAmount);
    expect(getAppliedGCAmt(giftCardAmount)).toBe(expectedGCApplied);
  });
});

const giftCardNumValid = ['15575', '565756', '56567567567546'];
describe('Gift card number validation on valid case', () => {
  test.each(giftCardNumValid)(
    'should return undefined for correct value',
    (giftCardNumber) => {
      const isFieldValueValid = checkPatternMatching({
        value: giftCardNumber,
        pattern: GC_NUMBER_REGEX_PATTERN,
      });
      expect(
        getErrorMessageLabel({
          id: GC_NUMBER,
          isFieldValueValid,
          value: giftCardNumber,
        })
      ).toBe(undefined);
    }
  );
});

const giftCardNumInvalid = ['1', '<><><', '546', '[{]}'];
describe('Gift card number validation on invalid case', () => {
  test.each(giftCardNumInvalid)(
    'should return error message for incorrect value',
    (giftCardNumber) => {
      const isFieldValueValid = checkPatternMatching({
        value: giftCardNumber,
        pattern: GC_NUMBER_REGEX_PATTERN,
      });
      expect(
        getErrorMessageLabel({
          id: GC_NUMBER,
          isFieldValueValid,
          value: giftCardNumber,
        })
      ).toBe(INVALID_GIFT_CARD_NUMBER);
    }
  );
});
