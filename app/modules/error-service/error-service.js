import { constructErrorObject } from './helpers';
import { SEVERITY_LEVELS } from './models';
import Analytics, { ErrorEvents, trackAvailabilty } from 'analytics/index';

/**
 * @param {String|Error|Object} error -
 * @param {Object} options
 * @param {Boolean} options.unhandled - Denotes whether the error was
 * caught or reported using global error/unhandled_rejection listeners
 * @param {SEVERITY_LEVELS} options.severity - Denotes the severity level
 * of the reported error
 */
export const capture = (
  error,
  { analytics, severity = SEVERITY_LEVELS.S1, unhandled = false }
) => {
  try {
    const { event, data, immediately = true } = analytics || {};
    /**
     * Event name to be used for analytics.
     * Defaulting to 'js_error' till we move to the new system of analytics events
     */
    const eventName = typeof event === 'string' ? event : ErrorEvents.JS_ERROR;
    if (severity === SEVERITY_LEVELS.S0 || severity === SEVERITY_LEVELS.S1) {
      trackAvailabilty('session_errored', severity);
    }
    Analytics.track(eventName, {
      data: {
        ...(typeof data === 'object' ? data : {}),

        /**
         * Intentionally overriding data.error prop to ensure
         * we're following the same structure across all errors
         * reported. If there is any data getting lost we should
         * look at restructuring how the data is passed
         */
        error: constructErrorObject(error, { severity, unhandled }),
      },

      /**
       * Constructing analytics.immediately property
       * Defaulting to true to ensure we capture all reported errors
       */
      immediately: Boolean(immediately),
    });
  } catch (e) {
    // try/catch to ensure `captureError` does not contribute to more
    // errors in global handler
  }
};

const ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://prod-checkout-canary.razorpay.com',
  'https://checkout-baseline.razorpay.com',
];

export function isUrlApplicableForErrorTracking(url) {
  return ERROR_TRACKING_URLS.some(function (availableUrl) {
    return url.startsWith(availableUrl);
  });
}

export function startErrorCapturing() {
  window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    if (typeof url === 'string' && !isUrlApplicableForErrorTracking(url)) {
      return;
    }
    const error = {
      message: errorMsg,
      lineNumber: lineNumber,
      fileName: url,
      columnNumber: column,
      stack: errorObj && errorObj.stack,
    };

    capture(error, {
      unhandled: true,
      analytics: {
        event: 'js_error',
        // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
        data: error,
      },
    });
  };

  window.addEventListener('unhandledrejection', function (event) {
    let reason = event.reason;

    if (reason instanceof Error) {
      reason = {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      };
    }

    capture(event.reason, {
      unhandled: true,
      analytics: {
        event: 'unhandled_rejection',
        // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
        data: {
          reason: reason,
        },
      },
    });
  });
}
