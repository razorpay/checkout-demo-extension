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
  /** Consent collection tracker for tokenization of saved cards in p13n and saved cards views */
  USER_CONSENT_FOR_TOKENIZATION: 'user_consent_for_tokenization',
  /** for know-more modal clicks */
  TOKENIZATION_KNOW_MORE_MODAL: 'tokenization_know_more_modal',
  /** tokenisation benefits modal is shown */
  TOKENIZATION_BENEFITS_MODAL_SHOWN: 'tokenization_benefits_modal_shown',
  /** yes, secure my card is clicked in tokenisation benefits modal */
  SECURE_CARD_CLICKED: 'secure_card_clicked',
  /** maybe later is clicked in tokenisation benefits modal */
  MAYBE_LATER_CLICKED: 'maybe_later_clicked',
} as const;

export default getEventsName('saved_cards', savedCardEvents);
