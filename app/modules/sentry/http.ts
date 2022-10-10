import fetch from 'utils/fetch';
import { isOneClickCheckout } from 'razorpay';

import { SENTRY_CONFIG } from './constants';
import { uuid4 } from 'common/uuid';
import { getContext } from './context';
import { exceptionFromError } from './parser';

const ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://checkout-static.razorpay.com',
];

let isErrorCaptureForThisSession = false;

export function isUrlApplicableForErrorTracking(url: string) {
  return ERROR_TRACKING_URLS.some(function (availableUrl) {
    return url.startsWith(availableUrl);
  });
}

/**
 * Captures errors and sends to sentry store endpoint.
 * Sentry Store Endpoint Reference: https://develop.sentry.dev/sdk/store/
 * @param {Error} error object
 */
export function captureError(error: Error) {
  // don't proceed if sentry is already injected
  if (window.Sentry) {
    return;
  }

  /**
   * for standard checkout we want to capture max one error per user session
   */
  if (!isOneClickCheckout() && isErrorCaptureForThisSession) {
    return;
  }

  const {
    SENTRY_ENVIRONMENT,
    SENTRY_RELEASE_VERSION,
    SENTRY_PUBLIC_KEY,
    SENTRY_PROJECT_ID,
    SENTRY_BASE_URL,
  } = SENTRY_CONFIG[isOneClickCheckout() ? 'magic' : 'standard'];

  const event_id = uuid4();

  try {
    const exception = exceptionFromError(error);

    const payload = {
      event_id,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      release: SENTRY_RELEASE_VERSION,
      environment: SENTRY_ENVIRONMENT,
      exception,
      contexts: {
        // its possible we don't get enough data for context if error trigger before preference completion
        checkout: getContext(),
      },
    };

    fetch.post({
      callback: (response) => {
        if (response.status_code !== 200) {
          window.dispatchEvent(
            new CustomEvent('sentry_http_failure', {
              detail: response,
            })
          );
        }
        isErrorCaptureForThisSession = true;
      },
      url: `${SENTRY_BASE_URL}/api/${SENTRY_PROJECT_ID}/store/`,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7,sentry_timestamp=${Date.now()},sentry_client=sentry-curl/1.0,sentry_key=${SENTRY_PUBLIC_KEY}`,
      } as Record<string, string>,
    });
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent('sentry_http_failure', {
        detail: e,
      })
    );
  }
}

export function startSentryMonitoring() {
  if (window.location.hostname !== 'api.razorpay.com') {
    return;
  }

  // window.onerror vs addEventListener('error): https://stackoverflow.com/questions/37933733/is-assigning-a-function-to-window-onerror-preferable-to-window-addeventlistener
  window.addEventListener('error', function (this: Window, event: ErrorEvent) {
    const url = event.filename;

    if (typeof url === 'string' && !isUrlApplicableForErrorTracking(url)) {
      return;
    }

    captureError(event.error as Error);
  });

  window.addEventListener(
    'unhandledrejection',
    function (this: Window, event: PromiseRejectionEvent) {
      const reason = event.reason;

      if (reason instanceof Error) {
        captureError(reason);
      }
    }
  );
}
