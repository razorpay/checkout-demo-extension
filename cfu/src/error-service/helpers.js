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

        // this won't copy non-enumerable (JSON)
        customError = window.Object.assign(JSON.parse(JSON.stringify(error)), {
          // Handling common non-enumerable properties
          name,
          message,
          stack,
          fileName,
          lineNumber,
          columnNumber,
          tags,
        });
      }
      break;

    // Final catch all in case error is passed as a string or any other unknown format. We can add new cases as we identify them
    default:
      customError.message = JSON.stringify(error);
  }

  return customError;
};
