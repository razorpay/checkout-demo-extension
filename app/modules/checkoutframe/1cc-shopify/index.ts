import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import fetch from 'utils/fetch';
import { isNonNullObject } from 'utils/object';
import { makeUrl } from 'common/helper';
import * as _ from 'utils/_';
import type {
  CreateShopifyCheckoutBody,
  CreateShopifyCheckoutResponse,
} from 'checkoutframe/1cc-shopify/interface';

/**
 * Related to the 1cc shopify flow, where the /checkout call
 * returns preferences after creating order
 * @param {Object} params containing all the params that are sent to the /preferences endpoint
 * @param {Object} body is the request body sent in the call
 * @param {Function} callback to be executed after API call is complete
 * @returns promise making the API call
 */
export function create1ccShopifyCheckout(
  params: any,
  body: any,
  callback: any
) {
  const apiTimer = _.timer();
  Analytics.track('1cc_shopify_checkout:start', {
    type: AnalyticsTypes.METRIC,
  });
  if (isNonNullObject(params)) {
    params['_[request_index]'] = Analytics.updateRequestIndex('preferences');
  }
  return fetch.post({
    url: _.appendParamsToUrl(makeUrl('1cc/shopify/checkout'), params),
    data: { send_preferences: true, ...body },
    callback: function (response) {
      Analytics.track('1cc_shopify_checkout:end', {
        type: AnalyticsTypes.METRIC,
        data: { time: apiTimer() },
      });
      callback(response);
    },
  });
}

export function createShopifyCheckoutId({
  body,
  key_id,
}: {
  body: CreateShopifyCheckoutBody;
  key_id: string;
}): Promise<CreateShopifyCheckoutResponse | any> {
  return new Promise((resolve, reject) => {
    const apiTimer = _.timer();
    Analytics.track('create_shopify_checkout:start', {
      type: AnalyticsTypes.METRIC,
    });
    fetch.post({
      url: _.appendParamsToUrl(makeUrl('magic/checkout/shopify'), { key_id }),
      data: body,
      callback: function (response) {
        Analytics.track('create_shopify_checkout:end', {
          type: AnalyticsTypes.METRIC,
          data: { time: apiTimer() },
        });
        if (response.status_code !== 200 || response.xhr.status !== 200) {
          reject({ error: response.error });
        }
        resolve(response.data as CreateShopifyCheckoutResponse);
      },
    });
  });
}
