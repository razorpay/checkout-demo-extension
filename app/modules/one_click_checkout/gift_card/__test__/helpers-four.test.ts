import { get } from 'svelte/store';
import { formatTemplateWithLocale } from 'i18n';
import { locale } from 'svelte-i18n';
import { removeGCToast } from 'one_click_checkout/gift_card/helpers';
import {
  showToastAfterDelay,
  TOAST_THEME,
  TOAST_SCREEN,
} from 'one_click_checkout/Toast';
import { setupPreferences } from 'tests/setupPreferences';
import { GC_TOAST_DELAY } from 'one_click_checkout/gift_card/constants';
import {
  GIFT_CARD_REMOVED,
  REMOVE_GC_APPLY_COUPON,
} from 'one_click_checkout/gift_card/i18n/labels';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('one_click_checkout/Toast', () => {
  const originalModule = jest.requireActual('one_click_checkout/Toast');

  return {
    __esModule: true,
    ...originalModule,
    showToastAfterDelay: jest.fn(),
  };
});

describe('Remove Gift Card Toast', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': { configs: { one_cc_gift_card: true } },
    });
  });
  it('should show remove gift card toast with gift card amount', async () => {
    const appliedGCAmt = 50000;
    const msg = GIFT_CARD_REMOVED;
    const data = {
      amount: 500, // ₹500
    };
    removeGCToast(appliedGCAmt); // ₹500
    expect(showToastAfterDelay).toHaveBeenCalled();
    expect(showToastAfterDelay).toHaveBeenCalledWith(
      expect.objectContaining({
        delay: GC_TOAST_DELAY,
        message: formatTemplateWithLocale(msg, data, get(locale) as string),
        theme: TOAST_THEME.INFO,
        screen: TOAST_SCREEN.COMMON,
      }),
      300
    );
  });
  it('should show remove gift card toast with gift card amount & coupon code', async () => {
    const appliedGCAmt = 50000;
    const msg = REMOVE_GC_APPLY_COUPON;
    const couponCode = 'WELCOME';
    const data = {
      amount: 500, // ₹500
      code: couponCode,
    };
    removeGCToast(appliedGCAmt, couponCode); // ₹500
    expect(showToastAfterDelay).toHaveBeenCalled();
    expect(showToastAfterDelay).toHaveBeenCalledWith(
      expect.objectContaining({
        delay: GC_TOAST_DELAY,
        message: formatTemplateWithLocale(msg, data, get(locale) as string),
        theme: TOAST_THEME.INFO,
        screen: TOAST_SCREEN.COMMON,
      }),
      300
    );
  });
});
