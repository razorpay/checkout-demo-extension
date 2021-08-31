import { constructErrorObject } from './helpers';
import { SEVERITY_LEVELS } from './models';
import { sendErrorToAnalytics } from './transporters/analytics';

const makeErrorService = () => {
  /**
   * @param {String|Error|Object} error -
   *
   * @param options
   *   @param {Boolean} options.unhandled - Denotes whether the error was caught or reported using global error/unhandled_rejection listeners
   *   @param {SEVERITY_LEVELS} options.severity - Denotes the severity level of the reported error
   */
  const captureError = (
    error,
    { analytics, severity = SEVERITY_LEVELS.S1, unhandled = false }
  ) => {
    try {
      const customError = constructErrorObject(error, { severity, unhandled });
      sendErrorToAnalytics({
        analytics,
        error: customError,
      });
    } catch (e) {
      // try/catch to ensure `captureError` does not contribute to more errors in global handler
    }
  };

  return {
    captureError,
    SEVERITY_LEVELS,
  };
};

export default makeErrorService;
