const OTP_EXPIRES_AFTER = {
  razorpay: 30000, // API expires an OTP after 5 minutes
};

const OTP_LIMIT = {
  razorpay: 4, // One OTP sent + 3 retries
};

const OTPS_SENT = {
  razorpay: 0,
};

const LAST_OTP_SENT_AT = {
  razorpay: undefined,
};

const PAYMENT_DATA = {};

/**
 * Marks the sending of an OTP.
 * @param {string} provider
 *
 * @returns {boolean} Whether or not any more OTPs can be sent.
 */
export const markOtpSent = (provider) => {
  if (!provider) {
    return;
  }

  const now = Date.now();

  const lastSentAt = LAST_OTP_SENT_AT[provider];
  const expiresAfter = OTP_EXPIRES_AFTER[provider];
  const otpLimit = OTP_LIMIT[provider] || Infinity;
  let otpsSent = OTPS_SENT[provider] || 0;

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

  OTPS_SENT[provider] = otpsSent;
  LAST_OTP_SENT_AT[provider] = now;

  return otpsSent < otpLimit;
};

/**
 * Check whether or not we can send more OTPs.
 * @param {string} provider
 *
 * @returns {boolean}
 */
export const canSendOtp = (provider) => {
  if (!provider) {
    return;
  }

  const now = Date.now();

  const lastSentAt = LAST_OTP_SENT_AT[provider];
  const expiresAfter = OTP_EXPIRES_AFTER[provider];
  const otpLimit = OTP_LIMIT[provider] || Infinity;
  let otpsSent = OTPS_SENT[provider] || 0;

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
export const resetCount = (provider) => {
  if (!provider) {
    return;
  }

  OTPS_SENT[provider] = 0;
  LAST_OTP_SENT_AT[provider] = undefined;
};

/**
 * Returns the count of OTPs sent so far.
 * @param {string} provider
 *
 * @returns {number} count
 */
export const getCount = (provider) => {
  if (!provider) {
    return 0;
  }

  return OTPS_SENT[provider] || 0;
};

/**
 * Sets the payment data
 * @param {string} payment_id
 * @param {Object} data
 */
export const setPaymentData = (payment_id, data = {}) => {
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
export const getPaymentData = (payment_id) => {
  if (payment_id) {
    return PAYMENT_DATA[payment_id];
  }
};
