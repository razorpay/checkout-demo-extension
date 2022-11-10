// svelte imports
import { get } from 'svelte/store';

// UI imports
import {
  showToast,
  TOAST_THEME,
  TOAST_SCREEN,
  hideToast,
} from 'one_click_checkout/Toast';

// i18n imports
import { format } from 'i18n';
import {
  ERR_GSTIN,
  ERR_ORD_INS,
  ERR_GSTIN_ORD_INS,
} from 'one_click_checkout/gstin/i18n/labels';

// analytics imports
import { Events } from 'analytics';
import GSTINEvents from 'one_click_checkout/gstin/analytics';

// store imports
import {
  gstIn,
  orderInstruction,
  prevGSTIN,
  prevOrderInstruction,
} from 'one_click_checkout/gstin/store';

// helper imports
import { enabledGSTIN, enabledOrderInstruction } from 'razorpay';

/**
 * Method to show GSTIN & Order Instruction Error message
 */
export const showGSTINErrMsg = () => {
  let errMsg: string;
  let eventName: string;
  if (enabledGSTIN() && enabledOrderInstruction()) {
    errMsg = ERR_GSTIN_ORD_INS;
    eventName = GSTINEvents.GSTIN_ORDER_NOTES_UPDATE_FAILED;
  } else if (enabledGSTIN()) {
    errMsg = ERR_GSTIN;
    eventName = GSTINEvents.GSTIN_ENTERED;
  } else {
    errMsg = ERR_ORD_INS;
    eventName = GSTINEvents.ORDER_NOTES_UPDATE_FAILED;
  }
  Events.TrackRender(eventName);
  hideToast();
  showToast({
    message: format(errMsg),
    theme: TOAST_THEME.ERROR,
    screen: TOAST_SCREEN.ONE_CC,
  });
};

export const updateGSTIN = () =>
  get(prevGSTIN) !== get(gstIn) ||
  get(prevOrderInstruction) !== get(orderInstruction);
