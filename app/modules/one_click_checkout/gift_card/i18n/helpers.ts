// store imports
import { get } from 'svelte/store';
import { appliedOffer } from 'offers/store/store';

// i18n imports
import {
  PAY_GIFT_CARD,
  RESTRICT_GC_VIA_GC,
  RESTRICT_OFFER,
  RESTRICT_COUPON,
  RESTRICT_COD_BANNER,
} from 'one_click_checkout/gift_card/i18n/labels';

// utils imports
import {
  restrictBuyGCViaGC,
  restrictCODWithGC,
} from 'one_click_checkout/gift_card/helpers';
import { enabledRestrictCoupon } from 'razorpay';

// type imports
import type { labelFuncType } from 'one_click_checkout/gift_card/types/giftcard';

const buyGCViaGC = () => restrictBuyGCViaGC() && RESTRICT_GC_VIA_GC;
const codWithGC = () => restrictCODWithGC() && RESTRICT_COD_BANNER;
const offerWithGC = () => get(appliedOffer) && RESTRICT_OFFER;
const couponWithGC = () => enabledRestrictCoupon() && RESTRICT_COUPON;
const defaultGCLabel = () => PAY_GIFT_CARD;

export const GC_BANNER_LABEL = [
  buyGCViaGC,
  codWithGC,
  offerWithGC,
  couponWithGC,
  defaultGCLabel,
];

export const getLabel = (labels: Array<labelFuncType>) =>
  labels?.find((labelMethod: labelFuncType) => labelMethod())?.() || '';
