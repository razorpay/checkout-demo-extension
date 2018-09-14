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
  debit_card: 'Debit Card',
  credit_card: 'Credit Card',
  emandate: 'Bank Account',
  emi: 'EMI',
  card: 'Card',
  netbanking: 'Netbanking',
  wallet: 'Wallet',
  upi: 'UPI',
  ecod: 'Pay by Link',
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
export const isIframe = window !== parent;
export const ownerWindow = isIframe ? parent : opener;
