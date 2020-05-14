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

/**
 * TODO: doesn't really fit for `common/constants`
 * Move to `checkout/constants` if and when we create it.
 */
export const TAB_TITLES = {
  card: 'Card',
  cardless_emi: 'EMI',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  emandate: 'Account Details',
  emi: 'EMI',
  emiplans: 'EMI Plans',
  nach: 'NACH',
  netbanking: 'Netbanking',
  paylater: 'Pay Later',
  paypal: 'PayPal',
  qr: 'UPI QR',
  upi: 'UPI',
  upi_otm: 'UPI Mandate',
  gpay: 'Google Pay',
  wallet: 'Wallet',
  payout_account: 'Add Bank Account',
  payout_upi: 'Add UPI ID',
  bank_transfer: 'Bank Transfer',
};

/* .shown has display: none from iOS ad-blocker
 * using दृश्य, which will never be seen by tim cook
 */
export const SHOWN_CLASS = 'drishy';

export const CONTACT_PATTERN = '^\\+?[0-9]{8,15}$';
export const CONTACT_REGEX = new RegExp(CONTACT_PATTERN);

// Number may or may not contain +91 and should start with any of 6/7/8/9
export const INDIAN_CONTACT_PATTERN = '^(\\+91)?[6-9]\\d{9}$';
export const INDIAN_CONTACT_REGEX = new RegExp(INDIAN_CONTACT_PATTERN);

export const EMAIL_PATTERN = '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';
export const EMAIL_REGEX = new RegExp(EMAIL_PATTERN);

export const UPI_POLL_URL = 'rzp_upi_payment_poll_url';
export const PENDING_PAYMENT_TS = 'rzp_upi_pending_payment_timestamp';
export const MINUTES_TO_WAIT_FOR_PENDING_PAYMENT = 10;

export const cookieDisabled = !navigator.cookieEnabled;
export const isIframe = global !== global.parent;
export const ownerWindow = isIframe ? global.parent : global.opener;

export const EMI_HELP_TEXT =
  'EMI is available on HDFC, ICICI, RBL, Kotak, IndusInd, Yes Bank, ' +
  'Standard Chartered and Axis Bank Credit Cards. Enter your credit card ' +
  'to avail.';

// Change this when running experiment 2 for Debit + Pin: Select ATM PIN by default.
export const DEFAULT_AUTH_TYPE_RADIO = 'c3ds';

export const STRINGS = {
  process: 'Your payment is being processed',
  redirect: 'Redirecting to Bank page',
};

/* Being used for filtering actual methods from methods object */
export const AVAILABLE_METHODS = [
  'card',
  'netbanking',
  'wallet',
  'upi_otm',
  'upi',
  'gpay',
  'emi',
  'cardless_emi',
  'qr',
  'paylater',
  'paypal',
  'bank_transfer',
  'nach',
];

/* VPA regex, copied from API */
export const VPA_REGEX = /^[a-z0-9][a-z0-9.-]{2,}@[a-z]+$/i;

export const NO_PAYMENT_ADAPTER_ERROR = 'Payment Adapter does not exist.';

export const INDIA_COUNTRY_CODE = '+91';

export const MAX_PREFERRED_INSTRUMENTS = 3;

export const COLORS = {
  RAZORPAY_COLOR: '#528FF0',
  RAZORPAY_HOVER_COLOR: '#626A74',
  TEXT_COLOR_BLACK: 'rgba(0, 0, 0, 0.85)',
  TEXT_COLOR_WHITE: '#FFFFFF',
};
