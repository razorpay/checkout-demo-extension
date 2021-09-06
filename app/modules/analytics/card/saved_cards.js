import { getEventsName } from '../helpers';

// Events for saved cards
const savedCardEvents = {
  __PREFIX: '__PREFIX', // this will convert to toUpperCase(prefix) : prefix
  /** check if saved cards exist */
  CHECK_SAVED_CARDS: 'check',
  /** hide saved card screen */
  HIDE_SAVED_CARDS: 'hide',
  /** show saved card screen */
  SHOW_SAVED_CARDS: 'show',
  /** skip saved card in otp screen */
  SKIP_SAVED_CARDS: 'skip',
  /** EMI plan show for saved card */
  EMI_PLAN_VIEW_SAVED_CARDS: 'emi:plans:view',
  /** OTP verification for saving card */
  OTP_SUBMIT_SAVED_CARDS: 'save:otp:submit',
  /** OTP verification for accessing saved cards */
  ACCESS_OTP_SUBMIT_SAVED_CARDS: 'access:otp:submit',
};

export default getEventsName('saved_cards', savedCardEvents);