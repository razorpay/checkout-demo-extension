import Coupons from 'one_click_checkout/coupons/ui/Coupons.svelte';
import { views } from 'one_click_checkout/routing/constants';
import {
  successHandler as couponOTPSuccessHandler,
  skipCouponOTP,
} from 'one_click_checkout/coupons/helpers';
import { OTP_LABELS } from 'one_click_checkout/coupons/constants';

const config = {
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

export default config;
