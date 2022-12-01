// svelte imports
import { get, Writable } from 'svelte/store';

// UI imports
import Toast from 'one_click_checkout/Toast/ui/Toast.svelte';
import {
  showToast,
  showToastAfterDelay,
  TOAST_THEME,
  TOAST_SCREEN,
} from 'one_click_checkout/Toast';

// session imports
import { applyCoupon } from 'one_click_checkout/coupons/sessionInterface';

// store imports
import {
  appliedGiftCards,
  totalAppliedGCAmt,
  optimisedGiftCards,
  disableCOD,
  giftCardForm,
  updatedGiftCards,
} from 'one_click_checkout/gift_card/store';
import { amount, isCodAddedToAmount } from 'one_click_checkout/charges/store';
import { cartItems } from 'one_click_checkout/cart/store';
import { contact, email } from 'checkoutstore/screens/home';
import {
  removeCouponInStore,
  isCouponApplied,
  appliedCoupon,
  prevAppliedCoupon,
  couponInputSource,
} from 'one_click_checkout/coupons/store';

// Analytics imports
import { Events } from 'analytics';
import GiftCardEvents from 'one_click_checkout/gift_card/analytics';

// i18n imports
import { format, formatTemplateWithLocale } from 'i18n';
import { locale } from 'svelte-i18n';
import {
  REMOVE_GIFT_CARD,
  INVALID_GIFT_CARD_NUMBER,
  APPLY_GIFT_CARD,
  PAY_BALANCE_AMOUNT,
  VALID_GIFT_CARD,
  GIFT_CARD_REMOVED,
  INVALID_GIFT_CARD,
  REMOVE_GIFT_CARD_FAILED,
  REMOVE_GC_APPLY_COUPON,
  PARTIAL_REDEMPTION_DISALLOWED,
  GIFT_CARD_APPLIED,
  REQUIRED_LABEL,
} from 'one_click_checkout/gift_card/i18n/labels';

// utils imports
import { popStack } from 'navstack';
import {
  getCurrency,
  enabledRestrictCoupon,
  showGiftCard,
  enabledMultipleGiftCard,
  enabledBuyGiftCard,
  enabledRestrictCOD,
} from 'razorpay';
import { formatAmountWithSymbol } from 'common/currency';
import {
  showLoaderView,
  hideLoaderView,
} from 'one_click_checkout/loader/helper';

// service imports
import {
  handleGiftCardApply,
  handleGiftCardRemove,
} from 'one_click_checkout/gift_card/service';

// Constant imports
import {
  GC_NUMBER,
  GC_MODAL_CLASS,
  MIN_AMOUNT,
  GC_TOAST_DELAY,
  GC_LOADER_CLASS,
  GC_REMOVE_CLASS,
  OPTIMIZER_GC_SOURCE,
  MANUAL_GC_SOURCE,
  GIFT_CARD_TYPE,
} from 'one_click_checkout/gift_card/constants';

// type imports
import type {
  validateGCParams,
  appliedGiftCardsType,
  removeGCToastData,
  removeGCAnalyticsData,
  couponType,
  applyGCRes,
} from 'one_click_checkout/gift_card/types/giftcard';

/**
 * Method to validate Gift card number & pin
 * @param {Object}
 * @return {string}
 */
export const getErrorMessageLabel = ({
  id,
  isFieldValueValid,
  value,
}: validateGCParams) => {
  if (!value) {
    return REQUIRED_LABEL;
  }

  if (!isFieldValueValid) {
    switch (id) {
      case GC_NUMBER:
        return INVALID_GIFT_CARD_NUMBER;
    }
  }
};

/**
 * Method to show Gift card Error Message
 */
export const showGCErrMsg = () => {
  if (get(appliedGiftCards)?.length) {
    showToast({
      delay: GC_TOAST_DELAY,
      message: format(PAY_BALANCE_AMOUNT),
      theme: TOAST_THEME.ERROR,
      screen: TOAST_SCREEN.COMMON,
    });
  }
};

/**
 * Method to get maximum Gift card amount to apply
 * @param {number} giftCardAmt
 * @return {number}
 */
export const getAppliedGCAmt = (giftCardAmt: number): number => {
  const totalAmt = get(amount);
  let appliedAmt = 0;
  if (totalAmt < giftCardAmt) {
    appliedAmt = totalAmt - MIN_AMOUNT;
  } else if (totalAmt > giftCardAmt) {
    appliedAmt = giftCardAmt;
  } else {
    appliedAmt = giftCardAmt - MIN_AMOUNT;
  }
  return appliedAmt;
};

/**
 * Method to create Gift card Error Toast
 * @return {SvelteComponent}
 */
export const createGCErrToast = () => {
  return new Toast({
    target: document.getElementById(GC_MODAL_CLASS) as HTMLElement,
  });
};

/**
 * Method to optimise the applied Gift card
 */
export const optimiseGCApply = () => {
  const appliedGCList = [...get(appliedGiftCards)];
  let recentlyAppliedGCBal = appliedGCList[appliedGCList.length - 1].balanceAmt;
  if (
    recentlyAppliedGCBal &&
    enabledMultipleGiftCard() &&
    appliedGCList.length > 1
  ) {
    const updatedGCList = [...appliedGCList];
    const rmvGCList: string[] = [];
    appliedGCList.pop();
    appliedGCList?.sort((firstGC, secondGC) =>
      firstGC.giftCardValue > secondGC.giftCardValue ? 1 : -1
    );
    appliedGCList?.forEach(({ giftCardValue }) => {
      if (recentlyAppliedGCBal > giftCardValue) {
        recentlyAppliedGCBal -= giftCardValue;
        rmvGCList.push(updatedGCList.shift()?.giftCardNumber || '');
      }
    });
    const recentlyAppliedGC = updatedGCList[updatedGCList.length - 1];
    updatedGCList[updatedGCList.length - 1] = {
      ...recentlyAppliedGC,
      appliedAmt: recentlyAppliedGC.giftCardValue - recentlyAppliedGCBal,
      balanceAmt: recentlyAppliedGCBal,
    };
    optimisedGiftCards.set(updatedGCList);
    if (rmvGCList.length) {
      removeGiftCard(rmvGCList);
    }
  }
};

/**
 * Method to apply the Gift card
 */
export const applyGiftCard = () => {
  showLoaderView(APPLY_GIFT_CARD, GC_LOADER_CLASS);

  const payload: { email?: string; contact: string } = {
    contact: get(contact),
  };
  if (get(email)) {
    payload['email'] = get(email);
  }

  handleGiftCardApply({
    ...payload,
    giftCardValue: get(giftCardForm),
  })
    .then((res) => {
      const shouldRemoveCoupon =
        enabledRestrictCoupon() && get(isCouponApplied);
      if (shouldRemoveCoupon) {
        (prevAppliedCoupon as Writable<couponType>).set({
          code: get(appliedCoupon),
          source: get(couponInputSource),
        });
        removeCouponInStore();
      }
      if (enabledRestrictCOD()) {
        disableCOD.set(true);
      }
      const { gift_card_promotion } = res as applyGCRes;
      const {
        gift_card_number: giftCardNumber,
        allowedPartialRedemption = 0,
        balance,
      } = gift_card_promotion;
      const isAllowPartialRedm = allowedPartialRedemption === 1;
      const appliedAmt = getAppliedGCAmt(Number(balance));
      const balanceAmt = Number(balance) - appliedAmt;
      appliedGiftCards.update((prevGiftCards) => [
        ...prevGiftCards,
        {
          giftCardNumber,
          giftCardValue: Number(balance),
          appliedAmt,
          balanceAmt,
        },
      ]);
      optimiseGCApply();
      amount.set(get(amount) - appliedAmt);
      Events.TrackMetric(GiftCardEvents.GC_APPLIED_SUCCESS, {
        gc_amount: balance,
        gc_card_number: giftCardNumber,
        payment_balance: get(amount),
        count_of_gc: get(appliedGiftCards).length,
        coupon_removed: shouldRemoveCoupon,
        partial_redemption_allowed: isAllowPartialRedm,
      });
      const appEntireGC = formatTemplateWithLocale(
        GIFT_CARD_APPLIED,
        {
          amount: formatAmountWithSymbol(appliedAmt, getCurrency(), false),
        },
        get(locale) as string
      );
      const applyGCToastMsg = enabledMultipleGiftCard()
        ? appEntireGC
        : format(VALID_GIFT_CARD);
      showToast({
        delay: GC_TOAST_DELAY,
        message:
          isAllowPartialRedm || !balanceAmt
            ? applyGCToastMsg
            : format(PARTIAL_REDEMPTION_DISALLOWED),
        theme: TOAST_THEME.SUCCESS,
        screen: TOAST_SCREEN.COMMON,
      });
      popStack();
    })
    .catch((error) => {
      const toast = createGCErrToast();
      toast.show({
        delay: GC_TOAST_DELAY,
        message: error?.failure_reason || format(INVALID_GIFT_CARD),
        theme: TOAST_THEME.ERROR,
        screen: TOAST_SCREEN.COMMON,
      });
      Events.TrackMetric(GiftCardEvents.GC_APPLIED_ERROR, {
        error_message: error?.description,
      });
    })
    .finally(() => {
      hideLoaderView();
    });
};

/**
 * Method to apply available balance from the applied Gift card, if total order value is increased
 */
export const applyBalanceGCAmt = () => {
  if (showGiftCard() && get(appliedGiftCards)?.length) {
    const appliedGC = get(appliedGiftCards);
    const giftCardWithBalance = appliedGC[appliedGC.length - 1];
    const { balanceAmt, appliedAmt } = giftCardWithBalance;
    if (get(amount) > MIN_AMOUNT && balanceAmt) {
      const currAppliedAmt = appliedAmt + getAppliedGCAmt(balanceAmt);
      appliedGC[appliedGC.length - 1] = {
        ...giftCardWithBalance,
        appliedAmt: currAppliedAmt,
        balanceAmt: balanceAmt + appliedAmt - currAppliedAmt,
      };
      appliedGiftCards.set(appliedGC);
      amount.set(get(amount) - (currAppliedAmt - appliedAmt));
    }
  }
};

/**
 * Method to reset the amount to applied Gift card, if total order value is decreased
 */
export const resetBalanceGCAmt = () => {
  if (showGiftCard() && get(appliedGiftCards)?.length) {
    const appliedGC: appliedGiftCardsType[] = get(appliedGiftCards)
      .slice()
      .reverse();
    let totalCartValue: number = get(amount) - MIN_AMOUNT;
    let currTotalGCApplied = 0;
    const prevTotalGCApplied = get(totalAppliedGCAmt);
    appliedGC.forEach(({ appliedAmt, giftCardValue }, index) => {
      totalCartValue =
        totalCartValue < 0 ? totalCartValue + appliedAmt : appliedAmt;
      const updatedAppliedGCAmt = totalCartValue < 0 ? 0 : totalCartValue;
      currTotalGCApplied += updatedAppliedGCAmt;
      appliedGC[index] = {
        ...appliedGC[index],
        appliedAmt: updatedAppliedGCAmt,
        balanceAmt: giftCardValue - updatedAppliedGCAmt,
      };
    });
    amount.set(prevTotalGCApplied - currTotalGCApplied + get(amount));
    const updatedGCList = appliedGC
      .slice()
      .reverse()
      .filter(({ appliedAmt }) => appliedAmt !== 0);
    const rmvGCList: string[] = [];
    appliedGC.forEach(({ appliedAmt, giftCardNumber }) => {
      if (!appliedAmt) {
        rmvGCList.push(giftCardNumber);
      }
    });
    if (rmvGCList.length) {
      updatedGiftCards.set(updatedGCList);
      removeGiftCard(rmvGCList);
    } else {
      appliedGiftCards.set(appliedGC);
    }
  }
};

amount.subscribe((amount: number) => {
  if (amount > MIN_AMOUNT) {
    applyBalanceGCAmt();
  } else if (amount < 0) {
    resetBalanceGCAmt();
  }
});

/**
 * Method returns the gift card amount for the selected gift card.
 * @param {string} selectedGCNumber
 * @return {number}
 */
export const getSelectedGCAmt = (selectedGCNumber: string): number => {
  let giftCardAmt = 0;
  get(appliedGiftCards).forEach(({ giftCardNumber, giftCardValue }) => {
    if (selectedGCNumber === giftCardNumber) {
      giftCardAmt = giftCardValue;
    }
  });
  return giftCardAmt;
};

/**
 * Method to show toast during the removal of a gift card
 * @param {number} appliedGCAmt
 * @param {string} coupon
 */
export const removeGCToast = (appliedGCAmt: number, coupon?: string) => {
  let msg = GIFT_CARD_REMOVED;
  const data: removeGCToastData = {
    amount: formatAmountWithSymbol(appliedGCAmt, getCurrency(), false),
  };
  if (coupon) {
    msg = REMOVE_GC_APPLY_COUPON;
    data.code = coupon;
  }
  showToastAfterDelay(
    {
      delay: GC_TOAST_DELAY,
      message: formatTemplateWithLocale(msg, data, get(locale) as string),
      theme: TOAST_THEME.INFO,
      screen: TOAST_SCREEN.COMMON,
    },
    300
  );
};

/**
 * Method to apply previously applied coupon
 * @param {number} appliedGCAmt
 */
export const applyPrevCouponCode = (appliedGCAmt: number) => {
  const { code, source } = get(prevAppliedCoupon as Writable<couponType>);
  const hideCouponLoader = true;
  applyCoupon(
    code,
    source,
    {
      onValid: () => {
        hideLoaderView();
        Events.TrackMetric(GiftCardEvents.GC_REMOVED_COUPON_SUCCESS);
        removeGCToast(appliedGCAmt, code);
      },
      onInvalid: () => {
        hideLoaderView();
        Events.TrackMetric(GiftCardEvents.GC_REMOVED_COUPON_FAILURE);
        removeGCToast(appliedGCAmt);
      },
    },
    hideCouponLoader
  );
};

/**
 * Method to identify the cart items contain Gift card product
 * @return {boolean}
 */
export const restrictBuyGCViaGC = () =>
  enabledBuyGiftCard() &&
  !!get(cartItems).find(({ type }) => type === GIFT_CARD_TYPE);

/**
 * Method to identify restrict COD with Gift card is enabled
 * @return {boolean}
 */
export const restrictCODWithGC = () =>
  enabledRestrictCOD() && get(isCodAddedToAmount);

/**
 * Method to trigger remove gift card analytics events
 * @param {*} param0
 */
export const removeGCAnalytics = ({
  event,
  extraProperty = {},
  selectedGiftCards,
  rmvSource,
}: removeGCAnalyticsData) => {
  selectedGiftCards.forEach((giftCardNumber: string) => {
    Events.TrackBehav(event, {
      gc_amount: getSelectedGCAmt(giftCardNumber),
      gc_card_number: giftCardNumber,
      payment_balance: get(amount),
      removal_reason: rmvSource,
      ...extraProperty,
    });
  });
};

/**
 * Method to remove applied Gift card
 * @param {Array<string>} selectedGiftCards
 * @param {string} source
 */
export const removeGiftCard = (
  selectedGiftCards: string[],
  source?: string
) => {
  const rmvSource = source || OPTIMIZER_GC_SOURCE;
  removeGCAnalytics({
    event: GiftCardEvents.GC_REMOVED,
    selectedGiftCards,
    rmvSource,
  });
  if (rmvSource === MANUAL_GC_SOURCE) {
    showLoaderView(REMOVE_GIFT_CARD, GC_REMOVE_CLASS);
  }
  handleGiftCardRemove(selectedGiftCards)
    .then(() => {
      let appliedGCAmt = 0;
      if (get(updatedGiftCards)?.length) {
        appliedGiftCards.set(get(updatedGiftCards));
      } else if (
        get(optimisedGiftCards)?.length &&
        rmvSource !== MANUAL_GC_SOURCE
      ) {
        appliedGiftCards.set(get(optimisedGiftCards));
      } else {
        appliedGiftCards.update((prevGiftCardList) => {
          prevGiftCardList.forEach(({ giftCardNumber, appliedAmt }, index) => {
            if (selectedGiftCards.includes(giftCardNumber)) {
              prevGiftCardList.splice(index, 1);
              appliedGCAmt = appliedAmt;
            }
          });
          return prevGiftCardList;
        });
      }
      if (get(disableCOD) && !get(appliedGiftCards)?.length) {
        disableCOD.set(false);
      }
      amount.set(get(amount) + appliedGCAmt);
      applyBalanceGCAmt();
      let couponReapplied = false;
      if (
        enabledRestrictCoupon() &&
        get(prevAppliedCoupon as Writable<couponType>)?.code &&
        !get(appliedGiftCards)?.length
      ) {
        couponReapplied = true;
        applyPrevCouponCode(appliedGCAmt);
      } else if (rmvSource === MANUAL_GC_SOURCE) {
        hideLoaderView();
        removeGCToast(appliedGCAmt);
      }

      removeGCAnalytics({
        event: GiftCardEvents.GC_REMOVED_SUCCESS,
        extraProperty: { coupon_reapplied: couponReapplied },
        selectedGiftCards,
        rmvSource,
      });
    })
    .catch((error) => {
      Events.TrackMetric(GiftCardEvents.GC_REMOVED_ERROR, {
        error_message: error?.description,
      });
      hideLoaderView();
      showToast({
        delay: GC_TOAST_DELAY,
        message: error?.failure_reason || format(REMOVE_GIFT_CARD_FAILED),
        theme: TOAST_THEME.ERROR,
        screen: TOAST_SCREEN.COMMON,
      });
    })
    .finally(() => {
      optimisedGiftCards.set([]);
      updatedGiftCards.set([]);
    });
};
