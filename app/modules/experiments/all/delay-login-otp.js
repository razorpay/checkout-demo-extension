import { getSegmentOrCreate } from 'experiments';
// import type { Experiment } from 'types/experiment';

export const EXPERIMENT_NAME = 'delay_login_otp';

/**
 * Checks in the localstorage if `delay_login_otp` experiment is enabled
 * @returns {Boolean} true or false
 */
export function delayLoginOTP() {
  return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}

export const DELAY_LOGIN_OTP_EXPERIMENT = {
  name: EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.25 ? 0 : 1),
};
