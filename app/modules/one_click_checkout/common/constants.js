import { CtaViews as CTA_LABELS } from 'ui/labels/cta';

export const OTP_PARAMS = {
  loading: {
    addFunds: false,
    loading: true,
    showInput: false,
    // skipTextLabel,
    // allowSkip,
    textView: 'otp_sending_generic',
    disableCTA: true,
    errorMessage: '',
    ctaLabel: `cta.${CTA_LABELS.VERIFY}`,
  },
  sent: {
    addFunds: false,
    loading: false,
    showInput: true,
    // skipTextLabel,
    // allowSkip,
    textView: 'generic_send_otp',
    disableCTA: true,
    ctaLabel: `cta.${CTA_LABELS.VERIFY}`,
  },
  verifying: {
    addFunds: false,
    loading: true,
    showInput: false,
    // skipTextLabel,
    // allowSkip,
    textView: 'generic_send_otp',
    disableCTA: true,
    ctaLabel: `cta.${CTA_LABELS.VERIFY}`,
  },
};
