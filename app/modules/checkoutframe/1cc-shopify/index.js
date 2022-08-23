import Analytics from 'analytics';
import fetch from 'utils/fetch';
import { isNonNullObject } from 'utils/object';
import { makeUrl } from 'common/helper';

/**
 * Related to the 1cc shopify flow, where the /checkout call
 * returns preferences after creating order
 * @param {Object} params containing all the params that are sent to the /preferences endpoint
 * @param {Object} body is the request body sent in the call
 * @param {Function} callback to be executed after API call is complete
 * @returns promise making the API call
 */
export function create1ccShopifyCheckout(params, body, callback) {
  if (isNonNullObject(params)) {
    params['_[request_index]'] = Analytics.updateRequestIndex('preferences');
  }
  return fetch.post({
    url: _.appendParamsToUrl(makeUrl('1cc/shopify/checkout'), params),
    data: { send_preferences: true, ...body },
    callback: function (response) {
      callback(response);
    },
  });
}
