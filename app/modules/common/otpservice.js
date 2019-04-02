const RZP_OTP_EXP_TIME = 300000; // API expires an OTP after 5 minutes
const MAX_OTP_LIMIT = 4; // One OTP sent + 3 retries

let numberOfOtpsSent = 0;
let lastOtpSentAt;

/**
 * Marks the sending of an OTP.
 *
 * @return {Boolean} Whether or not any more OTPs can be sent.
 */
export const markOtpSent = () => {
  const now = Date.now();

  // Has the OTP on API expired by now?
  const hasOtpExpired = lastOtpSentAt
    ? now - lastOtpSentAt >= RZP_OTP_EXP_TIME
    : false;

  // If OTP has expired, this is the first OTP.
  if (hasOtpExpired) {
    numberOfOtpsSent = 1;
  } else {
    numberOfOtpsSent++;
  }

  lastOtpSentAt = now;

  return numberOfOtpsSent < MAX_OTP_LIMIT;
};

/**
 * Check whether or not we can sent more OTPs.
 *
 * @return {Boolean}
 */
export const canSendOtp = () => {
  const now = Date.now();
  // Has the OTP on API expired by now?
  const hasOtpExpired = lastOtpSentAt
    ? now - lastOtpSentAt >= RZP_OTP_EXP_TIME
    : false;

  if (hasOtpExpired) {
    return true;
  }

  if (numberOfOtpsSent < MAX_OTP_LIMIT) {
    return true;
  }

  return false;
};
