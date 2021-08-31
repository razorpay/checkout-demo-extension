import { SEVERITY_LEVELS } from './models';

/**
 * @typedef {Object} CustomError
 *
 * @property {String} message
 * @property {String=} name
 * @property {String=} stack
 * @property {String=} fileName
 * @property {String=} columnNumber
 * @property {String=} lineNumber
 *
 * @property {Object} tags
 *   @property {SEVERITY_LEVELS} tags.severity
 *   @property {Boolean} tags.unhandled
 */

/**
 * Construct a custom error object to be used across all errors reported from the application
 * @param {String|Error|Object} error
 *
 * @param {Object} opts
 * @param {String} opts.severity
 * @param {String} opts.severity
 *
 * @returns {CustomError} customError
 */
export const constructErrorObject = (error, { severity, unhandled }) => {
  const tags = { severity, unhandled };

  if (!error) {
    // Shouldn't ideally happen but including it to ensure we aren't missing any errors
    const customError = {
      message: 'NA',
      tags,
    };
    return customError;
  }

  /**
   * Handle the most common case where we have an Error object with message property
   */
  if (typeof error === 'object' && error.message) {
    // Carry over all enumerable properties
    const customError = _Obj.clone(error);

    // Handling common non-enumerable properties
    const { name, message, stack, fileName, lineNumber, columnNumber } = error;
    Object.assign(customError, {
      name,
      message,
      stack,
      fileName,
      lineNumber,
      columnNumber,
    });

    // Attaching tags(severity,unhandled)
    customError.tags = tags;
    return customError;
  }

  // Final catch all in case error is passed as a string or any other unknown format. We can add new cases as we identify them
  const errorMessage =
    typeof error === 'string' ? error : JSON.stringify(error);
  const customError = {
    message: errorMessage,
    tags,
  };
  return customError;
};
