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
 * @param {Object} tags
 * @param {String} tags.severity
 * @param {String} tags.unhandled
 *
 * @returns {CustomError} customError
 */
export const constructErrorObject = (error, tags) => {
  let customError = { tags };

  switch (true) {
    case !error:
      // Shouldn't ideally happen but including it to ensure we aren't missing any errors
      customError.message = 'NA';
      break;

    case typeof error === 'string':
      customError.message = error;
      break;

    case typeof error === 'object':
      {
        const { name, message, stack, fileName, lineNumber, columnNumber } =
          error;

        customError = {
          // this won't copy non-enumerable
          ...JSON.parse(JSON.stringify(error)),

          // Handling common non-enumerable properties
          name,
          message,
          stack,
          fileName,
          lineNumber,
          columnNumber,
          tags,
        };
      }
      break;

    // Final catch all in case error is passed as a string or any other unknown format. We can add new cases as we identify them
    default:
      customError.message = JSON.stringify(error);
  }

  return customError;
};
