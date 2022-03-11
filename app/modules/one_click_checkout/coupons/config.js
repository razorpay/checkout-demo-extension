import Coupons from 'one_click_checkout/coupons/ui/Coupons.svelte';
import CouponsList from 'one_click_checkout/coupons/ui/CouponsList.svelte';
import { views } from 'one_click_checkout/routing/constants';
import {
  successHandler as couponOTPSuccessHandler,
  skipCouponOTP,
  skipCouponListOTP,
} from 'one_click_checkout/coupons/helpers';
import { OTP_LABELS } from 'one_click_checkout/coupons/constants';

export const coupons = {
  name: views.COUPONS,
  component: Coupons,
  isBackEnabled: false,
  props: {},
  otpProps: {
    successHandler: couponOTPSuccessHandler,
    skipOTPHandle: skipCouponOTP,
  },
  otpLabels: OTP_LABELS,
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
};
