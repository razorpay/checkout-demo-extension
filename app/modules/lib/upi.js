/**
 * Parses the response from UPI Intent.
 * @param {Object} intentResponse Reponse from Intent.
 *
 * @return {Object}
 */
export const parseUPIIntentResponse = intentResponse => {
  let response = {};

  if (intentResponse.response) {
    if (_.isNonNullObject(intentResponse.response)) {
      response = intentResponse.response;
    } else if (_.isString(intentResponse.response)) {
      // Convert the string response into a JSON object.
      let split = intentResponse.response.split('&');

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

  return response;
};

/**
 * Tells whether the payment using UPI Intent was successful or not.
 * @param {Object} parsedResponse Parsed Intent Response from the PSP UPI app.
 *
 * @return {Boolean}
 */
export const didUPIIntentSucceed = parsedResponse =>
  Boolean(parsedResponse.txnId);
