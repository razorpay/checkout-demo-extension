import { DELAY_LOGIN_OTP_EXPERIMENT } from './all/delay-login-otp';
import { CARDS_SEPARATION_EXPERIMENT } from './all/cards-separation';
import { HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP } from './all/highlightUpiIntentInstrumentOnDesktop';
import { ONE_CLICK_UPI_INTENT_EXPERIMENT } from './all/one-click-upi-intent';
/**
 * Experiment format:
 * {
 *    name: 'string',
 *    evaluator: function that returns a segment
 * }
 */

export default [
  HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP,
  CARDS_SEPARATION_EXPERIMENT,
  DELAY_LOGIN_OTP_EXPERIMENT,
  ONE_CLICK_UPI_INTENT_EXPERIMENT,
];
