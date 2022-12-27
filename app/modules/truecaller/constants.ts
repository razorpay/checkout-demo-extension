import type { UserVerifyTruecallerErrorApiResponse } from './types';

export const TRUECALLER_POLLING_INTERVAL = 3000; // in ms
export const TRUECALLER_MAX_PENDING_ATTEMPT_COUNT = 10;
export const MIN_SKIP_COUNT_TO_DISABLE_TRUECALLER_LOGIN = 3;
export const TRUECALLER_USER_METRIC_STORAGE_KEY_NAME = 'truecaller_user_metric';
export const TRUECALLER_MAX_REQUEST_NONCE_LENGTH = 64;
// we get 61 char base id from backend, on frontend we generate the request nonce
// by merging BASE_ID-ATTEMPT_COUNT. If Truecaller accepts 64 char id, then
// we can go upto only 99 for chars to have max length of 2 (as one char is used by `-`)
export const TRUECALLER_MAX_ID_GENERATION_ATTEMPT_COUNT = 99;

// on magic checkout contact screen we are autmatically triggering Truecaller
// If checkout takes more than 15 seconds to open, Truecaller is blocked
// To be on safer side, we are checking if preferences took more than
// 13 seconds to resolve. If yes, then we don't auto trigger
export const MAX_TIME_TO_ENABLE_TRUECALLER_AUTO_TRIGGER = 13000; // in ms

export const ERRORS = {
  TRUECALLER_NOT_FOUND: 'TRUECALLER_NOT_FOUND',
  TRUECALLER_LOGIN_DISABLED: 'TRUECALLER_LOGIN_DISABLED',
  USER_DISMISSED_LOADER: 'USER_DISMISSED_LOADER',
};

export const CUSTOMER_VERIFY_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const;

// Lists supported languages by Truecaller and
// has mapping of Truecaller <-> Checkout langs
export const SUPPORTED_LANGUAGES = {
  en: 'en', //'english'
  hi: 'hi', //'hindi'
  mr: 'mar', //'marathi'
  te: 'tel', //'telugu'
  ml: false, //'malayalam'
  ur: false, //'urdu'
  pa: false, //'punjabi'
  ta: 'tam', //'tamil'
  bn: 'ben', //'bengali'
  kn: 'kan', //'kannada'
  sw: false, //'swahili'
  ar: false, //'arabic'
} as const;

export const SUPPORTED_LANGUAGES_CODES = Object.keys(SUPPORTED_LANGUAGES);

export const TRUECALLER_DISABLED_REASONS = {
  cookie_not_enabled: 'cookie_not_enabled',
  disabled_on_unsupported_browser: 'disabled_on_unsupported_browser',
  disabled_on_private_window: 'disabled_on_private_window',
  disabled_on_merchant_level: 'disabled_on_merchant_level',
  disabled_on_platform_level: 'disabled_on_platform_level',
  disabled_for_method_prefill: 'disabled_for_method_prefill',
  disabled_for_non_editable_contact: 'disabled_for_non_editable_contact',
  disabled_for_exceeding_skip_count: 'disabled_for_exceeding_skip_count',
  user_already_logged_in: 'user_already_logged_in',
  currency_non_inr: 'currency_non_inr',
  truecaller_not_present: 'truecaller_not_present',
  request_id_not_present: 'request_id_not_present',
  id_generation_attempt_exceeded: 'id_generation_attempt_exceeded',
  should_not_remember_customer: 'should_not_remember_customer',
  disabled_by_screen_variant_feature_flag:
    'disabled_by_screen_variant_feature_flag',
  disabled_by_experiment: 'disabled_by_experiment',
  disabled_for_checkout_v1: 'disabled_for_checkout_v1',
} as const;

export const TRIGGER_TRUECALLER_INTENT_EVENT = 'trigger_truecaller_intent';
export const TRUECALLER_DETECTION_DELAY = 600; // in ms

export const TRUECALLER_VARIANT_NAMES = {
  contact_screen: 'contact_screen',
  preferred_methods: 'preferred_methods',
  access_saved_cards: 'access_saved_cards',
  add_new_card: 'add_new_card',
} as const;

export const TRUECALLER_LOGIN_VARIANTS_FEATURE_FLAG_AND_EXPERIMENT_MAPPINGS = {
  contact_screen: {
    featureFlag: 'features.truecaller_login_contact_screen',
    onceCCExperimentFlag: 'experiments.truecaller_1cc_for_non_prefill',
    standardCheckoutExperimentFlag:
      'experiments.truecaller_standard_checkout_for_non_prefill',
    experimentVariants: [
      'test', // for 1cc only
      'contact',
    ],
  },
  preferred_methods: {
    featureFlag: 'features.truecaller_login_home_screen',
    onceCCExperimentFlag: 'experiments.truecaller_1cc_for_prefill',
    standardCheckoutExperimentFlag:
      'experiments.truecaller_standard_checkout_for_prefill',
    experimentVariants: [
      'test', // for 1cc only
      'home_and_add_card',
      'home_and_access_saved_cards_and_add_card',
    ],
  },

  access_saved_cards: {
    featureFlag: 'features.truecaller_login_saved_cards_screen',
    onceCCExperimentFlag: 'experiments.truecaller_1cc_for_prefill',
    standardCheckoutExperimentFlag:
      'experiments.truecaller_standard_checkout_for_prefill',
    experimentVariants: [
      'test', // for 1cc only
      'access_saved_cards_and_add_card',
      'home_and_access_saved_cards_and_add_card',
    ],
  },

  add_new_card: {
    featureFlag: 'features.truecaller_login_add_new_card_screen',
    onceCCExperimentFlag: 'experiments.truecaller_1cc_for_prefill',
    standardCheckoutExperimentFlag:
      'experiments.truecaller_standard_checkout_for_prefill',
    experimentVariants: [
      'test', // for 1cc only
      'home_and_add_card',
      'access_saved_cards_and_add_card',
      'home_and_access_saved_cards_and_add_card',
    ],
  },
} as const;

export const TRUECALLER_API_REJECTION_CODES: {
  [K in UserVerifyTruecallerErrorApiResponse['code']]: K;
} = {
  use_another_number: 'use_another_number',
  user_rejected: 'user_rejected',
} as const;

export const TRUECALLER_CLIENT_REJECTION_CODES = {
  client_unresponsive: 'client_unresponsive',
  unhandled_error: 'unhandled_error',
} as const;
