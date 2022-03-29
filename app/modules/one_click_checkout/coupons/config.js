import Coupons from 'one_click_checkout/coupons/ui/Coupons.svelte';
import CouponsList from 'one_click_checkout/coupons/ui/CouponsList.svelte';
import { views } from 'one_click_checkout/routing/constants';
import {
  successHandler as couponOTPSuccessHandler,
  skipCouponOTP,
  skipCouponListOTP,
} from 'one_click_checkout/coupons/helpers';
import { OTP_LABELS } from 'one_click_checkout/coupons/constants';
import { SUMMARY_LABEL } from 'one_click_checkout/topbar/i18n/label';
import { COUPON_LABEL } from 'one_click_checkout/coupons/i18n/labels';

export const coupons = {
  name: views.COUPONS,
  component: Coupons,
  isBackEnabled: true,
  props: {},
  otpProps: {
    successHandler: couponOTPSuccessHandler,
    skipOTPHandle: skipCouponOTP,
  },
  otpLabels: OTP_LABELS,
  breadcrumHighlight: SUMMARY_LABEL,
};

export const couponsList = {
  name: views.COUPONS_LIST,
  component: CouponsList,
  tabTitle: views.COUPONS,
  isBackEnabled: true,
  props: {},
  otpProps: {
    successHandler: couponOTPSuccessHandler,
    skipOTPHandle: skipCouponListOTP,
  },
  otpLabels: OTP_LABELS,
  topbarTitle: COUPON_LABEL,
};
