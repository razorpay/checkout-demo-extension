export const OTP_LABELS = {
  loading: {
    headingText: 'none',
    textView: 'otp_sending_generic',
  },
  sent: {
    headingText: 'mandate_login',
    textView: 'mandate_login',
    loading: false,
    showInput: true,
    action: false,
    allowSkip: true,
    otp: '',
    skipTextLabel: 'skip_saved_address',
  },
  verifying: {
    heading: 'none',
    textView: 'verifying_otp',
  },
};
