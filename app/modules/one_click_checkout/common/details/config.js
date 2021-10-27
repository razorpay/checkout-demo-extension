import Details from 'ui/tabs/home/PaymentDetails.svelte';
import { views } from 'one_click_checkout/routing/constants';
import { OTP_LABELS as DETAILS_OTP_LABELS } from 'one_click_checkout/common/details/constants';

import {
  handleDetailsNext,
  isBackEnabledOnDetails,
  handleDetailsOTP,
} from 'one_click_checkout/common/details/helpers';
const details = {
  name: views.DETAILS,
  component: Details,
  props: { newCta: true, onSubmit: handleDetailsNext },
  isBackEnabled: isBackEnabledOnDetails,
  otpProps: handleDetailsOTP(),
  otpLabels: DETAILS_OTP_LABELS,
};

export default details;
