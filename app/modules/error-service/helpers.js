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

    case typeof error === 'object' && isNetworkError(error): {
      customError = {
        ...JSON.parse(JSON.stringify(error)),
        message: `[NETWORK ERROR] ${error.description}`,
      };
      break;
    }

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

/**
 * return true/false based on whether error object follow API error schema
 * @param err Error object
 */
function isNetworkError(err) {
  const errorKeys = [
    'source',
    'step',
    'description',
    'reason',
    'code',
    'metadata',
  ];

  return errorKeys.every((key) => err.hasOwnProperty(key));
}

/**
 * method checks whether the error is from a browser extension.
 * @param {String} stack
 *
 * @returns {Boolean}
 */
export const isExtensionError = (error) =>
  !!(
    error?.stack &&
    ['chrome-extension', 'moz-extension', 'webkit-masked-url'].some(
      (extension) => error.stack.includes(extension)
    )
  );

/**
 * method checks whether the error is valid error.
 * @param {Object} error
 *
 * @returns {Boolean}
 */
export const filterInvalidError = (error) => {
  try {
    const isInvalid = [isExtensionError].reduce(
      (isInvalidError, fn) => (!isInvalidError ? fn(error) : isInvalidError),
      false
    );

    return isInvalid;
  } catch (e) {
    return false;
  }
};
