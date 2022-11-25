import { constructErrorObject, filterInvalidError } from './helpers';
import { SEVERITY_LEVELS } from './models';
import Analytics, {
  ErrorEvents,
  Track,
  trackAvailabilty,
} from 'analytics/index';
import Interface from 'common/interface';
import { ErrorTracker } from './analytics/events';
import { EventsV2 } from 'analytics-v2';
import { IS_PROD } from 'common/constants';
import type {
  Error,
  TrackerTriggered,
  ErrorParam,
  CaptureErrorOptions,
} from 'error-service/types';
/**
 * @param {String|Error|Object} error -
 * @param {Object} options
 * @param {Boolean} options.unhandled - Denotes whether the error was
 * caught or reported using global error/unhandled_rejection listeners
 * @param {SEVERITY_LEVELS} options.severity - Denotes the severity level
 * of the reported error
 */
export const capture = (
  error: ErrorParam,
  {
    analytics,
    severity = SEVERITY_LEVELS.S1,
    unhandled = false,
  }: CaptureErrorOptions
) => {
  try {
    const { event, data, immediately = true } = analytics || {};
    /**
     * don't track if its not prod
     * if its standard checkout library then check for domain
     * mode check is already available in tracker & availability module
     */
    if (
      (Track.props.library !== 'razorpayjs' && !IS_PROD) ||
      filterInvalidError(error as Error)
    ) {
      return;
    }
    /**
     * Event name to be used for analytics.
     * Defaulting to 'js_error' till we move to the new system of analytics events
     */
    const eventName = typeof event === 'string' ? event : ErrorEvents.JS_ERROR;
    if (severity === SEVERITY_LEVELS.S0 || severity === SEVERITY_LEVELS.S1) {
      trackAvailabilty('session_errored', severity);
    }
    const errorObj = constructErrorObject(error, { severity, unhandled });
    Analytics.track(eventName, {
      data: {
        ...(typeof data === 'object' ? data : {}),

        /**
         * Intentionally overriding data.error prop to ensure
         * we're following the same structure across all errors
         * reported. If there is any data getting lost we should
         * look at restructuring how the data is passed
         */
        error: errorObj,
      },

      /**
       * Constructing analytics.immediately property
       * Defaulting to true to ensure we capture all reported errors
       */
      immediately: Boolean(immediately),
      isError: true,
    });

    ErrorTracker.TRIGGERED({
      error: errorObj,
      last: EventsV2.getState()?.last,
    } as TrackerTriggered);
  } catch (e) {
    // try/catch to ensure `captureError` does not contribute to more
    // errors in global handler
  }
};

const ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://checkout-static.razorpay.com',
  'https://checkout-static-next.razorpay.com',
];

export function isUrlApplicableForErrorTracking(url: string) {
  return ERROR_TRACKING_URLS.some(function (availableUrl) {
    return url.indexOf(availableUrl) === 0;
  });
}

export function startErrorCapturing() {
  const existingOnError = window.onerror;
  Interface.sendMessage('clearMountErrorListener');
  window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    if (typeof url === 'string' && !isUrlApplicableForErrorTracking(url)) {
      existingOnError?.(errorMsg, url, lineNumber, column, errorObj);
      return;
    }
    const error = {
      message: errorMsg,
      lineNumber: lineNumber,
      fileName: url,
      columnNumber: column,
      stack: errorObj && errorObj.stack,
    };

    capture(error as ErrorParam, {
      unhandled: true,
      analytics: {
        event: 'js_error',
        // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
        data: error,
      },
    });
    existingOnError?.(errorMsg, url, lineNumber, column, errorObj);
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
