import fetch from 'utils/fetch';
import { obj2query } from 'utils/_';
import { getCurrentLocale } from 'i18n';
import Interface from 'common/interface';
import { isOneClickCheckout } from 'razorpay';
import { makeAuthUrl } from 'common/makeAuthUrl';
import { DEFAULT_DEEPLINK_CONFIG } from './config';
import {
  ERRORS,
  CUSTOMER_VERIFY_STATUS,
  TRUECALLER_POLLING_INTERVAL,
  TRUECALLER_MAX_PENDING_ATTEMPT_COUNT,
  TRUECALLER_VARIANT_NAMES,
} from './constants';
import { TRIGGER_TRUECALLER_INTENT_EVENT } from 'truecaller/constants';
import {
  truecallerPresent,
  truecallerUserMetric,
  incrementAttemptCount,
  truecallerAttemptCount,
} from './store';
import {
  sanitizeOverrideConfig,
  isTruecallerLoginEnabled,
  resetExpiredUserMetric,
  getCurrentTruecallerRequestId,
  getTruecallerLanguageCodeForCheckout,
} from './helpers';
import * as TruecallerLoader from 'truecaller/ui/components/Loader';

import type { FetchPrototype } from 'utils/fetch';
import type {
  OverrideConfig,
  Config,
  UserMetricStore,
  PromiseResolveType,
  PromiseRejectType,
  UserVerifyResponse,
  UserVerifySuccessApiResponse,
  TruecallerVariantNames,
  UserVerifyErrorApiResponse,
  UserVerifyTruecallerErrorApiResponse,
} from './types';

import { Events } from 'analytics';
import { EVENTS } from 'truecaller/analytics/events';
import { timer } from 'utils/timer';
import { get } from 'svelte/store';
import { startTruecallerTimer } from './analytics';

let pollingRequest: FetchPrototype;

export function buildTruecallerDeeplink(
  overrideConfig: Readonly<OverrideConfig>
) {
  // request nonce (aka. request id) is manadatory in override config,
  // other than that we need to check if the params are acceptable
  // if not, we fallback to default params. so sanitizing here.
  const Config: Config = {
    ...DEFAULT_DEEPLINK_CONFIG,
    ...sanitizeOverrideConfig(overrideConfig),
  };

  // since we are building a deeplink URL, the query params
  // should be URL safe, so we are encoding.
  const params = obj2query(Config);
  return `truecallersdk://truesdk/web_verify?${params}`;
}

function showTruecallerLoader(reject: PromiseRejectType) {
  TruecallerLoader.show({
    onDismiss: function () {
      stopVerificationPolling();
      reject({ code: ERRORS.USER_DISMISSED_LOADER });
    },
  });
}

export async function triggerTruecallerIntent(
  params: Readonly<
    Partial<Omit<OverrideConfig, 'requestNonce'>> | undefined
  > = {},
  variant: TruecallerVariantNames
) {
  resetExpiredUserMetric();
  const truecallerLoginEnabled = isTruecallerLoginEnabled(variant);
  if (!truecallerLoginEnabled.status) {
    return Promise.reject({
      code: ERRORS.TRUECALLER_LOGIN_DISABLED,
      reason: truecallerLoginEnabled.reason,
    });
  }

  incrementAttemptCount();

  const overrideConfig = {
    lang: getTruecallerLanguageCodeForCheckout(getCurrentLocale()),
    ...params,
    requestNonce: getCurrentTruecallerRequestId(),
  };

  return new Promise<UserVerifySuccessApiResponse>((resolve, reject) => {
    const timer = startTruecallerTimer(variant);
    try {
      // Since we wait for 600 ms before checking if truecaller is installed or not
      // we don't want to show the loader in contact screen as it'll just come and
      // go for 600ms when truecaller is not installed. For other screens we want
      // to show, as there would be some delay in screen swtich. For contact
      // screen we only show loader when we detect truecaller is installed
      if (variant !== TRUECALLER_VARIANT_NAMES.contact_screen) {
        showTruecallerLoader(reject);
      }

      Interface.publishToParent(TRIGGER_TRUECALLER_INTENT_EVENT, {
        url: buildTruecallerDeeplink(overrideConfig as OverrideConfig),
      });
      Interface.subscribe(
        `${TRIGGER_TRUECALLER_INTENT_EVENT}:finished`,
        (ev) => {
          const { focused } = ev.data || {};
          const eventDataPayload: any = timer();
          if (focused) {
            // Truecaller app not present on the device we reject the promise. So, that
            // the user can continue with checkout without logging in or use OTP login
            truecallerPresent.set(false);
            TruecallerLoader.hide();

            reject({ code: ERRORS.TRUECALLER_NOT_FOUND });
            eventDataPayload.failure_reason = ERRORS.TRUECALLER_NOT_FOUND;
          } else {
            truecallerPresent.set(true);
            Events.TrackRender(EVENTS.TRUECALLER_LOGIN_SHOWN);
            // For contact screen we want to show loader only when we detect that
            // truecaller is installed.
            if (variant === TRUECALLER_VARIANT_NAMES.contact_screen) {
              showTruecallerLoader(reject);
            }

            // Truecaller app present on the device and the profile overlay opens
            // The user clicks on verify & we'll receive the user's access token to fetch the profile on our
            // callback URL - post which, we can refresh the session at our frontend and complete the user verification
            startVerificationPolling(resolve, reject);
          }

          Events.TrackApi(EVENTS.TRUECALLER_INSTALLED, eventDataPayload);

          // Reset-subscription, to avoid multiple subscription callback triggers
          Interface.resetSubscriptions(
            `${TRIGGER_TRUECALLER_INTENT_EVENT}:finished`
          );
        }
      );
    } catch (error) {
      TruecallerLoader.hide();
      stopVerificationPolling();
      reject(error);
    }
  });
}

function startVerificationPolling(
  resolve: PromiseResolveType<UserVerifySuccessApiResponse>,
  reject: PromiseRejectType
) {
  const getDuration = timer();

  // cleanup if any pending polling request
  stopVerificationPolling();

  const prefix = isOneClickCheckout() ? '1cc/' : '';
  pollingRequest = fetch({
    url: makeAuthUrl(prefix + 'customers/truecaller/verify'),
    method: 'post',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
    data: { request_id: getCurrentTruecallerRequestId() },
    callback: (response: UserVerifyResponse) => {
      verifyLoginData(
        response,
        (response) => {
          Events.TrackApi(EVENTS.TRUECALLER_VERIFICATION, {
            success: true,
            verification_id: get(truecallerAttemptCount),
            duration: getDuration(),
          });
          resolve(response);
        },
        (error) => {
          let code = 'code' in error ? error.code : '';
          if ('error' in error) {
            code = error.error.code;
          }
          if (code === 'use_another_number') {
            Events.TrackBehav(EVENTS.USE_ANOTHER_NUMBER_CLICKED);
          }
          Events.TrackApi(EVENTS.TRUECALLER_VERIFICATION, {
            success: false,
            failure_reason: code,
            verification_id: get(truecallerAttemptCount),
            duration: getDuration(),
          });
          reject(error);
        }
      );
    },
  }).till(shouldContinuePolling(), 5, TRUECALLER_POLLING_INTERVAL);
}

function shouldContinuePolling(
  attemptLimit = TRUECALLER_MAX_PENDING_ATTEMPT_COUNT
) {
  let attemptCount = 0;
  return function (response: UserVerifyResponse) {
    if (attemptCount >= attemptLimit) {
      return false;
    }

    attemptCount++;

    if (
      'status' in response &&
      response.status !== CUSTOMER_VERIFY_STATUS.PENDING
    ) {
      return false;
    }

    return true;
  };
}

function verifyLoginData(
  response: UserVerifyResponse,
  onVerifySuccess: (response: UserVerifySuccessApiResponse) => void,
  onVerifyFailure: (
    error: UserVerifyTruecallerErrorApiResponse | UserVerifyErrorApiResponse
  ) => void
) {
  TruecallerLoader.hide();
  if (
    'status' in response &&
    response.status === CUSTOMER_VERIFY_STATUS.RESOLVED
  ) {
    return onVerifySuccess(response);
  }

  if ('error' in response) {
    return onVerifyFailure(response);
  }

  if (
    'status' in response &&
    response.status === CUSTOMER_VERIFY_STATUS.REJECTED &&
    'code' in response
  ) {
    if (['user_rejected', 'use_another_number'].includes(response.code)) {
      truecallerUserMetric.update((userMetric: UserMetricStore) => {
        return {
          skipped_count: userMetric.skipped_count + 1,
          timestamp: Date.now(),
        };
      });
    }

    return onVerifyFailure(response);
  }

  onVerifyFailure({
    error: {
      code: 'unhandled_error',
      description: 'An unhandled error ocurred',
    },
    response,
  });
}

export function stopVerificationPolling() {
  pollingRequest && pollingRequest.abort();
}
