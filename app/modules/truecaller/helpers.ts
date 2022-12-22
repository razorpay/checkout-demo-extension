import { get } from 'svelte/store';
import { getDayDiff } from 'utils/date';
import { definePlatform } from 'upi/helper/upi';
import { isValidHexColorCode } from 'utils/color';
import {
  AndroidWebView,
  isPrivate,
  chrome,
  samsungBrowser,
} from 'common/useragent';
import { isLoggedIn } from 'checkoutstore/customer';
import { shouldRememberCustomer } from 'checkoutstore/index';
import { isContactReadOnly } from 'checkoutframe/customer/customerPrefill';
import {
  getOption,
  getCurrency,
  getPreferences,
  isOneClickCheckout,
  isContactHidden,
  isRedesignV15,
  isEmailOptional,
  isContactOptional,
} from 'razorpay';
import {
  truecallerPresent,
  truecallerUserMetric,
  truecallerAttemptCount,
} from './store';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGES_CODES,
  MIN_SKIP_COUNT_TO_DISABLE_TRUECALLER_LOGIN,
  TRUECALLER_MAX_ID_GENERATION_ATTEMPT_COUNT,
  TRUECALLER_MAX_REQUEST_NONCE_LENGTH,
  TRUECALLER_DISABLED_REASONS,
  TRUECALLER_VARIANT_NAMES,
  TRUECALLER_LOGIN_VARIANTS_FEATURE_FLAG_AND_EXPERIMENT_MAPPINGS,
} from './constants';

import type { OverrideConfig, TruecallerCheckResponse } from './types';
import type { ValueOf } from 'types/utils';

export function sanitizeOverrideConfig(
  overrideConfig: Readonly<OverrideConfig>
): OverrideConfig {
  const sanitizedConfig = { ...overrideConfig };

  if (!sanitizedConfig.requestNonce) {
    throw new Error('Invalid config. requestNonce required');
  }

  if (
    sanitizedConfig.ctaColor &&
    !isValidHexColorCode(sanitizedConfig.ctaColor)
  ) {
    delete sanitizedConfig.ctaColor;
  }

  if (
    sanitizedConfig.ctaTextColor &&
    !isValidHexColorCode(sanitizedConfig.ctaTextColor)
  ) {
    delete sanitizedConfig.ctaTextColor;
  }

  if (
    sanitizedConfig.lang &&
    !SUPPORTED_LANGUAGES_CODES.includes(sanitizedConfig.lang)
  ) {
    delete sanitizedConfig.lang;
  }

  return sanitizedConfig;
}

function truecallerEnabledResponse() {
  return { status: true };
}

function truecallerDisabledResponse(
  reason: ValueOf<typeof TRUECALLER_DISABLED_REASONS>
) {
  return { status: false, reason };
}

export function isTruecallerLoginEnabledBeforePreferences(): TruecallerCheckResponse {
  // • Navigator check
  if (!navigator.cookieEnabled) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.cookie_not_enabled
    );
  }

  if (!chrome && !samsungBrowser) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_unsupported_browser
    );
  }

  if (isPrivate) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_private_window
    );
  }

  // • Check based on feature flag
  if (getOption('features.truecaller_login') === false) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_merchant_level
    );
  }

  // • Check based on platform - checkout options only
  if (!definePlatform('mWebAndroid') || AndroidWebView) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_platform_level
    );
  }
  // • Check based on checkout option
  if (isContactHidden() || isContactReadOnly()) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_for_non_editable_contact
    );
  }

  // • Check based on user metric
  if (
    get(truecallerUserMetric).skipped_count >=
    MIN_SKIP_COUNT_TO_DISABLE_TRUECALLER_LOGIN
  ) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_for_exceeding_skip_count
    );
  }
  return truecallerEnabledResponse();
}

export function isTruecallerLoginEnabled(
  variant: ValueOf<typeof TRUECALLER_VARIANT_NAMES>
): TruecallerCheckResponse {
  // • Pre-preferences check
  const prePreferencesCheck = isTruecallerLoginEnabledBeforePreferences();
  if (!prePreferencesCheck.status) {
    return prePreferencesCheck;
  }

  // • Disable if user already logged in
  if (get(isLoggedIn)) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.user_already_logged_in
    );
  }

  // • Check based on method prefill

  if (
    ['card', 'emi', 'cardless_emi'].includes(getOption('prefill.method')) &&
    (isContactOptional() || getOption('prefill.contact')) &&
    (isEmailOptional() || getOption('prefill.email'))
  ) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_for_method_prefill
    );
  }

  // • Disable if old checkout
  if (!isRedesignV15()) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_for_checkout_v1
    );
  }

  // • Experiment check
  if (!isExperimentEnabledForVariant(variant)) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_by_experiment
    );
  }

  // • Checkout Options check - Merchant level check (Global Flag)
  if (!isFeatureEnabledByPreferences('features.truecaller.login')) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_merchant_level
    );
  }

  // • Checkout Options check - Platform level check (mweb Flag)
  if (!isFeatureEnabledByPreferences('features.truecaller.login_mweb')) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_on_platform_level
    );
  }

  // • Checkout Options check
  if (!isFeatureEnabledForVariant(variant)) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.disabled_by_screen_variant_feature_flag
    );
  }

  // • Check based on currency
  if (getCurrency() !== 'INR') {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.currency_non_inr
    );
  }

  // • Check based on store values for truecaller present
  // allow for `null` - we haven't detected yet if truecaller is present
  if (get(truecallerPresent) === false) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.truecaller_not_present
    );
  }

  // • Check for truecaller request id in preferences
  if (!getPreferences('truecaller.request_id')) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.request_id_not_present
    );
  }

  // • Check for max id generation attempt count
  if (
    get(truecallerAttemptCount) >= TRUECALLER_MAX_ID_GENERATION_ATTEMPT_COUNT
  ) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.id_generation_attempt_exceeded
    );
  }

  // • Check based on existing login logic
  if (
    !shouldRememberCustomer(
      'card',
      variant === TRUECALLER_VARIANT_NAMES.contact_screen
    )
  ) {
    return truecallerDisabledResponse(
      TRUECALLER_DISABLED_REASONS.should_not_remember_customer
    );
  }

  return truecallerEnabledResponse();
}

export function resetExpiredUserMetric() {
  if (getDayDiff(get(truecallerUserMetric)?.timestamp) > 180) {
    truecallerUserMetric.set({
      skipped_count: 0,
      timestamp: Date.now(),
    });
  }
}

export function getTruecallerLanguageCodeForCheckout(
  checkoutLanguageCode = 'en'
) {
  return (
    Object.keys(SUPPORTED_LANGUAGES).find(
      (key) =>
        SUPPORTED_LANGUAGES[key as keyof typeof SUPPORTED_LANGUAGES] ===
        checkoutLanguageCode
    ) || 'en'
  );
}

export function getCurrentTruecallerRequestId() {
  const baseRequestId = getPreferences('truecaller.request_id') as string;

  return `${baseRequestId}-${String(get(truecallerAttemptCount)).padStart(
    2,
    '0'
  )}`.slice(0, TRUECALLER_MAX_REQUEST_NONCE_LENGTH);
}

export function isFeatureEnabledByPreferences(featureFlag: string) {
  const preferencesFeatureFlag = getPreferences(featureFlag as any);

  if (typeof preferencesFeatureFlag === 'boolean') {
    return preferencesFeatureFlag;
  }

  return false;
}

export function isFeatureEnabledForVariant(
  variant: ValueOf<typeof TRUECALLER_VARIANT_NAMES>
) {
  if (!variant) {
    return false;
  }

  return isFeatureEnabledByPreferences(
    TRUECALLER_LOGIN_VARIANTS_FEATURE_FLAG_AND_EXPERIMENT_MAPPINGS[variant]
      .featureFlag
  );
}

export function isExperimentEnabledForVariant(
  variant: ValueOf<typeof TRUECALLER_VARIANT_NAMES>
) {
  if (!variant) {
    return false;
  }

  const variantConfig =
    TRUECALLER_LOGIN_VARIANTS_FEATURE_FLAG_AND_EXPERIMENT_MAPPINGS[variant];

  if (isOneClickCheckout()) {
    return (
      variantConfig.experimentVariants as unknown as Array<string | boolean>
    ).includes(getPreferences(variantConfig.onceCCExperimentFlag));
  }

  return (
    variantConfig.experimentVariants as unknown as Array<string | boolean>
  ).includes(getPreferences(variantConfig.standardCheckoutExperimentFlag));
}
