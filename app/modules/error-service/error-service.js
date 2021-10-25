import { constructErrorObject } from './helpers';
import { SEVERITY_LEVELS } from './models';
import Analytics, { ErrorEvents } from 'analytics/index';

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
