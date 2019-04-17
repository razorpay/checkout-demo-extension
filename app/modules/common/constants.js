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
  ecod: 'Pay by Link',
  emandate: 'Bank Account',
  emi: 'EMI',
  emiplans: 'EMI Plans',
  netbanking: 'Netbanking',
  qr: 'QR',
  upi: 'UPI',
  gpay: 'Google Pay',
  wallet: 'Wallet',
};

/* .shown has display: none from iOS ad-blocker
 * using दृश्य, which will never be seen by tim cook
 */
export const SHOWN_CLASS = 'drishy';

export const CONTACT_PATTERN = /^\+?[0-9]{8,15}$/;
export const EMAIL_PATTERN = /^[^@\s]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

export const UPI_POLL_URL = 'rzp_upi_payment_poll_url';
export const PENDING_PAYMENT_TS = 'rzp_upi_pending_payment_timestamp';
export const MINUTES_TO_WAIT_FOR_PENDING_PAYMENT = 10;

export const cookieDisabled = !navigator.cookieEnabled;
export const isIframe = global !== global.parent;
export const ownerWindow = isIframe ? global.parent : global.opener;

export const AMEX_EMI_MIN = 5000 * 100 - 1;
export const EMI_HELP_TEXT =
  'EMI is available on HDFC, ICICI, RBL, Kotak, IndusInd, Yes Bank, ' +
  'Standard Chartered and Axis Bank Credit Cards. Enter your credit card ' +
  'to avail.';

// Change this when running experiment 2 for Debit + Pin: Select ATM PIN by default.
export const DEFAULT_AUTH_TYPE_RADIO = '3ds';
export const TIMEOUT_MAGIC_NO_ACTION = 30000;

export const STRINGS = {
  process: 'Your payment is being processed',
  redirect: 'Redirecting to Bank page',
};

/* Being used for filtering actual methods from methods object */
export const AVAILABLE_METHODS = [
  'card',
  'netbanking',
  'wallet',
  'upi',
  'emi',
  'cardless_emi',
  'qr',
];

/* VPA regex, copied from API */
export const VPA_REGEX = /^[a-z0-9][a-z0-9.-]{2,}@[a-zA-Z]+$/;
