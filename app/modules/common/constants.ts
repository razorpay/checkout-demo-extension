import { resolveUrl } from 'utils/doc';
import RazorpayConfig from './RazorpayConfig';

/*
https://pincode.net.in/listofstates.php
https://en.wikipedia.org/wiki/ISO_3166-2:IN
*/
export const STATES = {
  AN: 'Andaman and Nicobar Islands',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CT: 'Chhattisgarh',
  DN: 'Dadra and Nagar Haveli',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JK: 'Jammu and Kashmir',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  LD: 'Lakshadweep',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OR: 'Odisha',
  PY: 'Puducherry',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  TR: 'Tripura',
  UT: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

/* .shown has display: none from iOS ad-blocker
 * using दृश्य, which will never be seen by tim cook
 */
export const SHOWN_CLASS = 'drishy';

export const CONTACT_PATTERN = '^\\+?[0-9]{7,15}$';
export const CONTACT_REGEX = new RegExp(CONTACT_PATTERN);
export const PHONE_PATTERN = '^\\d{7,15}$';
export const PHONE_REGEX = new RegExp(PHONE_PATTERN);
export const PHONE_PATTERN_INDIA = `^\\d{10}$`;
export const PHONE_REGEX_INDIA = new RegExp(PHONE_PATTERN_INDIA);
export const COUNTRY_CODE_PATTERN = '^\\+[0-9]{1,6}$';
export const COUNTRY_CODE_REGEX = new RegExp(COUNTRY_CODE_PATTERN);
export const PHONE_NUMBER_LENGTH_INDIA = 10;

// Number may or may not contain +91 and should start with any of 6/7/8/9
export const INDIAN_CONTACT_PATTERN = '^(\\+91)?[6-9]\\d{9}$';
// Also added support of number starts from zero while validation (which we will remove on blur event)
export const INDIAN_CONTACT_REGEX_WITH_ZERO = new RegExp(
  '^(\\+91)?0?[6-9]\\d{9}$'
);
export const INDIAN_CONTACT_REGEX = new RegExp(INDIAN_CONTACT_PATTERN);

export const EMAIL_PATTERN = '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';
export const EMAIL_REGEX = new RegExp(EMAIL_PATTERN);

export const UPI_POLL_URL = 'rzp_upi_payment_poll_url';
export const PENDING_PAYMENT_TS = 'rzp_upi_pending_payment_timestamp';
export const MINUTES_TO_WAIT_FOR_PENDING_PAYMENT = 10;

export const cookieDisabled = !navigator.cookieEnabled;
export const isIframe = global !== global.parent;
export const ownerWindow = isIframe ? global.parent : global.opener;

// Change this when running experiment 2 for Debit + Pin: Select ATM PIN by default.
export const DEFAULT_AUTH_TYPE_RADIO = 'c3ds';

/* Being used for filtering actual methods from methods object */
/* The below array determines the order of payment methods shown in the homescreen */
export const AVAILABLE_METHODS = [
  'card',
  'upi',
  'netbanking',
  'wallet',
  'upi_otm',
  'gpay',
  'emi',
  'cardless_emi',
  'qr',
  'paylater',
  'paypal',
  'bank_transfer',
  'offline_challan',
  'nach',
  'app',
  'emandate',
  'cod',
  'international',
  'intl_bank_transfer',
] as const;

/* VPA regex, copied from API */
export const VPA_REGEX = /^[a-z0-9][a-z0-9.-]{2,}@[a-z]+$/i;

export const NO_PAYMENT_ADAPTER_ERROR = 'Payment Adapter does not exist.';

export const CHECK_ERROR = {
  description: NO_PAYMENT_ADAPTER_ERROR,
};

export const INDIA_COUNTRY_CODE = '+91';

export const COLORS = {
  RAZORPAY_COLOR: '#528FF0',
  RAZORPAY_HOVER_COLOR: '#626A74',
  TEXT_COLOR_BLACK: 'rgba(0, 0, 0, 0.85)',
  TEXT_COLOR_WHITE: '#FFFFFF',
  MAGIC_BRAND_COLOR: '#005bf2',
};

export const INDIA_COUNTRY_ISO_CODE = 'IN';

export const US_COUNTRY_ISO_CODE = 'US';

export const INDIA_PINCODE_REGEX = '^[1-9][0-9]{5}$';

/**
 * The following are the reasons for each flow
 * 1. Automatically created payment
 *    <within payment lifetime, ex: QR has 12min>
 *        If user opts for others
 *                unintended_payment_opt_out
 *    after payment lifetime
 *         we manually cancel
 *                unintended_payment_expired
 * 2. Payment Created by user/ with user consent
 *    <within payment lifetime, ex: QR has 12min>
 *        If user opts for others
 *                intended_payment_opt_out
 *    after payment lifetime
 *        we manually cancel
 *                Intended_payment_expired
 *
 */
export const PAYMENT_CANCEL_REASONS = {
  UNINTENDED_OPT_OUT: 'unintended_payment_opt_out',
  UNINTENDED_EXPIRE: 'unintended_payment_expired',
  INTENDED_OPT_OUT: 'intended_payment_opt_out',
  INTENDED_EXPIRE: 'intended_payment_expired',
};

export const SIFT_BEACON_KEY = '4dbbb1f7b6';
export const CYBER_SOURCE_RZP_ORG_ID = 'k8vif92e';

export const BUILD_NUMBER = __BUILD_NUMBER__; // eslint-disable-line no-undef
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const TRAFFIC_ENV = __TRAFFIC_ENV__ || '__S_TRAFFIC_ENV__'; // eslint-disable-line no-undef
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const COMMIT_HASH = __GIT_COMMIT_HASH__; // eslint-disable-line no-undef

export const STATIC_CDN_PREFIX = BUILD_NUMBER
  ? `https://checkout-static.razorpay.com/build/${COMMIT_HASH}`
  : '/dist/v1';

export const FRAME_CSS_URL = STATIC_CDN_PREFIX + '/css/checkout.css';
export const FRAME_JS_URL = STATIC_CDN_PREFIX + '/checkout-frame.js';

export const constantCSSVars = {
  'magic-brand-color': COLORS.MAGIC_BRAND_COLOR,
  // font-weights
  'font-weight-regular': 400, // default
  'font-weight-medium': 500,
  'font-weight-semibold': 600,
  'font-weight-bold': 700,
  // font-sizes
  'font-size-body': '14px', // default
  'font-size-heading': '16px',
  'font-size-small': '12px',
  'font-size-tiny': '10px',
  // text-colors
  'primary-text-color': '#171a1e', // default
  'secondary-text-color': '#414449',
  'tertiary-text-color': '#676a6d',
  'positive-text-color': '#4ea376',
  // errors
  'error-validation-color': '#d12d2d',
  // colors
  'background-color-magic': '#f0f0f4',
  'light-dark-color': '#d9dadb',
};

function isProd() {
  try {
    let url = RazorpayConfig.api;

    // RazorpayConfig.api is setting up later for checkout-frame that's why using frameApi url in case of iframe
    if (isIframe) {
      url = resolveUrl(RazorpayConfig.frameApi);
    }
    return (
      url.startsWith('https://api.razorpay.com') ||
      url.startsWith('https://api-dark.razorpay.com')
    );
  } catch (e) {
    return false;
  }
}

export const IS_PROD = isProd();
