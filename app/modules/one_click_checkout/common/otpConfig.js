import {
  submitOTP,
  resendOTPHandle,
  handleBack,
} from 'one_click_checkout/common/otp';
import OTP from 'one_click_checkout/otp/ui/OTP.svelte';
import { views } from 'one_click_checkout/routing/constants';

const otp = {
  name: views.OTP,
  component: OTP,
  props: {
    addShowableClass: false,
    newCta: true,
    onSubmit: submitOTP,
    resendOTPHandle,
    handleBack,
  },
  isBackEnabled: true,
};
export default otp;
