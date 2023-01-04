import type { PaymentData, LastOTPSent } from 'common/types/types';

const OTP_EXPIRES_AFTER = {
  razorpay: 30000, // API expires an OTP after 5 minutes
} as const;

const OTP_LIMIT = {
  razorpay: 4, // One OTP sent + 3 retries
} as const;

const OTPS_SENT = {
  razorpay: 0,
};

const LAST_OTP_SENT_AT: LastOTPSent = {
  razorpay: undefined,
};

const PAYMENT_DATA: PaymentData = {};

/**
 * Marks the sending of an OTP.
 * @param {string} provider
 *
 * @returns {boolean} Whether or not any more OTPs can be sent.
 */
export const markOtpSent = (provider: string) => {
  if (!provider) {
    return;
  }

  const now = Date.now();

  const lastSentAt =
    LAST_OTP_SENT_AT[provider as keyof typeof LAST_OTP_SENT_AT];
  const expiresAfter =
    OTP_EXPIRES_AFTER[provider as keyof typeof OTP_EXPIRES_AFTER];
  const otpLimit = OTP_LIMIT[provider as keyof typeof OTP_LIMIT] || Infinity;
  let otpsSent = OTPS_SENT[provider as keyof typeof OTPS_SENT] || 0;

  // Has the OTP expired by now?
  let hasOtpExpired = false;
  if (lastSentAt && expiresAfter) {
    hasOtpExpired = Boolean(now - lastSentAt >= expiresAfter);
  }

  // If OTP has expired, this is the first OTP.
  if (hasOtpExpired) {
    otpsSent = 1;
  } else {
    otpsSent++;
  }

  OTPS_SENT[provider as keyof typeof OTPS_SENT] = otpsSent;
  LAST_OTP_SENT_AT[provider as keyof typeof LAST_OTP_SENT_AT] = now;

  return otpsSent < otpLimit;
};

/**
 * Check whether or not we can send more OTPs.
 * @param {string} provider
 *
 * @returns {boolean}
 */
export const canSendOtp = (provider: string) => {
  if (!provider) {
    return;
  }

  const now = Date.now();

  const lastSentAt =
    LAST_OTP_SENT_AT[provider as keyof typeof LAST_OTP_SENT_AT];
  const expiresAfter =
    OTP_EXPIRES_AFTER[provider as keyof typeof OTP_EXPIRES_AFTER];
  const otpLimit = OTP_LIMIT[provider as keyof typeof OTP_LIMIT] || Infinity;
  const otpsSent = OTPS_SENT[provider as keyof typeof OTPS_SENT] || 0;

  // Has the OTP expired by now?
  let hasOtpExpired = false;
  if (lastSentAt && expiresAfter) {
    hasOtpExpired = Boolean(now - lastSentAt >= expiresAfter);
  }

  if (hasOtpExpired) {
    return true;
  }

  if (otpsSent < otpLimit) {
    return true;
  }

  return false;
};

/**
 * Resets the OTP count for the provider.
 * @param {string} provider
 */
export const resetCount = (provider: string) => {
  if (!provider) {
    return;
  }

  OTPS_SENT[provider as keyof typeof OTPS_SENT] = 0;
  LAST_OTP_SENT_AT[provider as keyof typeof LAST_OTP_SENT_AT] = undefined;
};

/**
 * Returns the count of OTPs sent so far.
 * @param {string} provider
 *
 * @returns {number} count
 */
export const getCount = (provider: string) => {
  if (!provider) {
    return 0;
  }

  return OTPS_SENT[provider as keyof typeof OTPS_SENT] || 0;
};

/**
 * Sets the payment data
 * @param {string} payment_id
 * @param {Object} data
 */
export const setPaymentData = (payment_id: string, data = {}) => {
  if (!payment_id) {
    return;
  }
  if (PAYMENT_DATA[payment_id]) {
    return;
  }
  PAYMENT_DATA[payment_id] = data;
};

/**
 * Returns the payment data if it was saved earlier
 * @param {string} payment_id
 * @returns {*}
 */
export const getPaymentData = (payment_id: string) => {
  if (payment_id) {
    return PAYMENT_DATA[payment_id];
  }
};
