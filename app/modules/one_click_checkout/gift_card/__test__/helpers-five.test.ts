import type { Writable } from 'svelte/store';
import { format } from 'i18n';
import { showToast, TOAST_THEME, TOAST_SCREEN } from 'one_click_checkout/Toast';
import { appliedGiftCards } from 'one_click_checkout/gift_card/store';
import { setupPreferences } from 'tests/setupPreferences';
import {
  showGCErrMsg,
  restrictCODWithGC,
} from 'one_click_checkout/gift_card/helpers';
import { PAY_BALANCE_AMOUNT } from 'one_click_checkout/gift_card/i18n/labels';
import { GC_TOAST_DELAY } from 'one_click_checkout/gift_card/constants';
import { isCodAddedToAmount } from 'one_click_checkout/charges/store';

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
    showToast: jest.fn(),
  };
});

describe('Show Gift card error message', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': { configs: { one_cc_gift_card: true } },
    });
  });
  it('should not show gift card error message toast when gift card not applied', async () => {
    showGCErrMsg();
    expect(showToast).not.toHaveBeenCalled();
  });
  it('should show gift card error message toast when gift card applied', async () => {
    appliedGiftCards.set([
      {
        giftCardNumber: '566556',
        giftCardValue: 10000, // actual gift card value ₹100
        appliedAmt: 10000, // applied gift card amount ₹100
        balanceAmt: 0, // balance gift card amount ₹0
      },
    ]);
    showGCErrMsg();
    expect(showToast).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        delay: GC_TOAST_DELAY,
        message: format(PAY_BALANCE_AMOUNT),
        theme: TOAST_THEME.ERROR,
        screen: TOAST_SCREEN.COMMON,
      })
    );
  });
});
const restrictCODValue = [
  { restrictCOD: true, isCodAdded: true, expValue: true },
  { restrictCOD: true, isCodAdded: false, expValue: false },
  { restrictCOD: false, isCodAdded: true, expValue: false },
  { restrictCOD: false, isCodAdded: false, expValue: false },
];
describe('Restrict COD with Gift card', () => {
  test.each(restrictCODValue)(
    'given restrictCOD & isCodAdded, returns expValue',
    ({ restrictCOD, isCodAdded, expValue }) => {
      setupPreferences('loggedIn', razorpayInstance, {
        '1cc': {
          configs: {
            one_cc_gift_card: true,
            one_cc_gift_card_cod_restrict: restrictCOD,
          },
        },
      });
      (isCodAddedToAmount as Writable<boolean | null>).set(isCodAdded);
      expect(restrictCODWithGC()).toBe(expValue);
    }
  );
});
