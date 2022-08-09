import { PROCEED_PAYMENT } from 'ui/labels/cta';

export const TAG_LABELS = {
  HOME: 'Home',
  OFFICE: 'Office',
  OTHERS: 'Others',
};

export const views = {
  ADD_ADDRESS: 'addAddress',
  SAVED_ADDRESSES: 'savedAddress',
  EDIT_ADDRESS: 'editAddress',
  OTP: 'otp',
};

export const ADDRESS_FORM_VIEWS = [views.ADD_ADDRESS, views.EDIT_ADDRESS];

export const errorLabels = {
  name: 'name',
  zipcode: 'zipcode',
  city: 'city',
  state: 'state',
  line1: 'House No, Floor, Apartment',
  line2: 'Area, Colony, Street, Sector',
};
export const OTP_LABELS = {
  loading: {
    headingText: 'none',
    textView: 'saved_addresses_sending',
  },
  sent: {
    headingText: 'mandate_login',
    textView: 'access_saved_addresses',
    loading: false,
    showInput: true,
    action: false,
    skipTextLabel: 'skip_saved_address',
    otp: '',
  },
  verifying: {
    headingText: 'none',
    textView: 'verifying_otp',
  },
};

export const MANDATORY_OTP_LABELS = {
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
  },
  verifying: {
    headingText: 'none',
    textView: 'verifying_otp',
  },
};

export const ADD_ADDRESS_OTP_LABELS = {
  loading: {
    headingText: 'none',
    textView: 'otp_sending_generic',
    ctaLabel: PROCEED_PAYMENT,
  },
  sent: {
    headingText: 'access_saved_addresses',
    textView: 'address',
    loading: false,
    showInput: true,
    action: false,
    skipTextLabel: 'skip_saved_address',
    otp: '',
    ctaLabel: PROCEED_PAYMENT,
  },
  verifying: {
    headingText: 'none',
    textView: 'verifying_otp',
    ctaLabel: PROCEED_PAYMENT,
  },
};

export const ADDRESS_TYPES = {
  SHIPPING_ADDRESS: 'shipping',
  BILLING_ADDRESS: 'billing',
};

export const ADDRESS_LONG_TYPES = {
  SHIPPING_ADDRESS: 'shipping_address',
  BILLING_ADDRESS: 'billing_address',
};

const INITIAL_ADDRESS = {
  name: '',
  contact: {
    countryCode: '',
    phoneNum: '',
  },
  zipcode: '',
  city: '',
  state: '',
  line1: '',
  line2: '',
  landmark: '',
  tag: 'Home',
  country_name: '',
};

export const INITIAL_SHIPPING_ADDRESS = {
  ...INITIAL_ADDRESS,
  type: 'shipping_address',
};

export const INITIAL_BILLING_ADDRESS = {
  ...INITIAL_ADDRESS,
  type: 'billing_address',
};

export const ZIPCODE_REQUIRED_LENGTH = 6;

export const TNC_LINK = 'https://razorpay.com/terms/';

export const PRIVACY_LINK = 'https://razorpay.com/privacy/';

export const SERVICEABILITY_STATUS = {
  UNCHECKED: 'unchecked',
  CHECKED: 'checked',
  LOADING: 'loading',
};

export const SOURCE = {
  ENTERED_BEFORE_AUTOCOMPLETE: 'entered_before_autocomplete', // 0
  PREFILLED: 'prefilled', // 1
  OVERIDDEN: 'overidden', // 2
};

// validators test the input in the state and city fields against this regex.
// it ensures that any accidental special characters don't seep inside the input
// that is not supported and result in error in response form BE.
// basically, only alphabets are allowed with a couple of exceptions.
export const CITY_STATE_REGEX_PATTERN = "^((?![0-9$+,:;=?@#|'<>.^*()%!]).)*$";

export const ENG_LANG_REGEX_PATTERN = "^[0-9a-zA-Z&+,:;@#'./*()\\s-]*$";
