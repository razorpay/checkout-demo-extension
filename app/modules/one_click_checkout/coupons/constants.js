export const ERROR_USER_NOT_LOGGED_IN = 'LOGIN_REQUIRED';
export const ERROR_INPUT_VALIDATION_FAILED = 'input_validation_failed';

export const LOADING_STATUS = 'loading';
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
    otp: '',
    skipTextLabel: 'skip_saved_address',
  },
  verifying: {
    headingText: 'none',
    textView: 'verifying_otp',
  },
};

export const DELIVERY_ADDRESS_WIDGET_DOM_ID = 'delivery-address-widget';
