/**
 * Parses the response from UPI Intent.
 * @param {Object} intentResponse Response from Intent.
 *
 * @return {Object}
 */
export const parseUPIIntentResponse = (intentResponse, param = 'response') => {
  const rawResponse = intentResponse[param];
  let response = {};

  if (rawResponse) {
    if (typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
      response = rawResponse;
    } else if (typeof rawResponse === 'string') {
      // Convert the string response into a JSON object.
      let split = rawResponse.split('&');

      for (let i = 0; i < split.length; i++) {
        let pair = split[i].split('=');

        if (pair[1] === '' || pair[1] === 'undefined' || pair[1] === 'null') {
          response[pair[0]] = null;
        } else {
          response[pair[0]] = pair[1];
        }
      }
    }
  }
  if (response.result) {
    // in case of result parameter
    response = {
      ...response,
      ...parseUPIIntentResponse(response, 'result'),
    };
  }
  return response;
};

/**
 * Tells whether the payment using UPI Intent was successful or not.
 * @param {Object} parsedResponse Parsed Intent Response from the PSP UPI app.
 *
 * @return {Boolean}
 */
export const didUPIIntentSucceed = (parsedResponse) =>
  Boolean(parsedResponse.txnId) ||
  (parsedResponse.Status || parsedResponse.status || '')
    .toLowerCase()
    .indexOf('suc') === 0;
