import { VPA_REGEX } from 'common/constants';
import { OTHER_INTENT_APPS, UPI_APPS } from '../constants';

/**
 * Parses the response from UPI Intent.
 * @param {Object} intentResponse IntentResponse from Intent.
 *
 * @return {Object}
 */
export const parseUPIIntentResponse = (
  intentResponse: UPI.RawIntentResponse | UPI.IntentResponse,
  param: string = 'response'
): UPI.IntentResponse => {
  const rawResponse = intentResponse[param] as string;
  let response: UPI.IntentResponse = {} as UPI.IntentResponse;

  if (rawResponse) {
    if (typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
      response = rawResponse;
    } else if (typeof rawResponse === 'string') {
      // Convert the string response into a JSON object.
      response = rawResponse.split('&').reduce((acc, currentPair) => {
        const [key, value] = currentPair.split('=');
        acc = {
          ...acc,
          [key]: ['', 'undefined', 'null'].includes(value) ? null : value,
        };
        return acc;
      }, response);
    }
  }
  if ((response as any).result) {
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
 * @param {Object} parsedResponse Parsed Intent response from the PSP UPI app.
 *
 * @return {Boolean}
 */
export const didUPIIntentSucceed = (
  parsedResponse: UPI.IntentResponse
): boolean =>
  Boolean(parsedResponse.txnId) ||
  (parsedResponse.Status || parsedResponse.status || '')
    .toLowerCase()
    .indexOf('suc') === 0;

/**
 *
 * @param {string} vpa
 * @returns {boolean}
 */
export function isVpaValid(vpa: string): boolean {
  return VPA_REGEX.test(vpa);
}

export const isPreferredApp = (packageName: string) =>
  doesAppExist(packageName, UPI_APPS.preferred);

/**
 * Returns a list containing the package names of all apps passed to the list.
 * @param {Array} list
 *
 * @return {String}
 */
const getPackageNames = (list: Array<UPI.AppConfiguration>): string[] => {
  // const arr:string[] = [];
  // list.forEach((app) => arr.push(app.package_name));
  // return arr;
  return list.map((config) => config.package_name);
};

/**
 * Returns whether or not an app exists in a list of apps.
 * @param {String} packageName
 * @param {Array} list Array of apps.
 *
 * @return {Boolean}
 */
export const doesAppExist = (
  packageName: string,
  list: Array<UPI.AppConfiguration>
): boolean => getPackageNames(list).indexOf(packageName) >= 0;

/**
 *
 * @param {string} package_name
 * @returns
 */
export function isOtherIntentApp(package_name: string) {
  return package_name === OTHER_INTENT_APPS.package_name;
}
