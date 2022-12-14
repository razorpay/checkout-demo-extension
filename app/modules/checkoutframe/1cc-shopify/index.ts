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
import {
  createShopifyOrder,
  clearShopifyOrder,
} from 'one_click_checkout/order/controller';
import { capture, SEVERITY_LEVELS } from '../../error-service';
import { throwMessage } from 'utils/_';

let SHOPIFY_CHECKOUT_PROMISE: any;

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

export function getShopifyCheckoutPromise() {
  return SHOPIFY_CHECKOUT_PROMISE;
}

export function clearShopifyCheckout() {
  SHOPIFY_CHECKOUT_PROMISE = null;
  clearShopifyOrder();
}

// @TODO move to i18n
const ERROR_SHOPIFY_ORDER_FAILED = 'Failed to process your order';

export function initShopifyCheckout({
  body,
  key_id,
}: {
  body: CreateShopifyCheckoutBody;
  key_id: string;
}) {
  SHOPIFY_CHECKOUT_PROMISE = createShopifyCheckout({ body, key_id });

  return createShopifyOrder(SHOPIFY_CHECKOUT_PROMISE).catch((err) => {
    // @TODO move to common error processor util
    if (!err) {
      err = { message: ERROR_SHOPIFY_ORDER_FAILED };
    } else if (typeof err === 'object' && !(err instanceof Error)) {
      err.message = err.message ?? ERROR_SHOPIFY_ORDER_FAILED;
    }

    capture(err, {
      unhandled: true,
      severity: SEVERITY_LEVELS.S2,
    });

    throw err;
  });
}

function createShopifyCheckout({
  body,
  key_id,
}: {
  body: CreateShopifyCheckoutBody;
  key_id: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiTimer = _.timer();
    Analytics.track('create_shopify_checkout:start', {
      type: AnalyticsTypes.METRIC,
    });
    fetch.post({
      headers: {
        'Content-Type': 'application/json',
        key_id: key_id,
      },
      url: _.appendParamsToUrl('/v1/magic/checkout/shopify', { key_id }),
      data: JSON.stringify(body),
      callback: function (response) {
        Analytics.track('create_shopify_checkout:end', {
          type: AnalyticsTypes.METRIC,
          data: { time: apiTimer() },
        });
        if (response.status_code !== 200) {
          reject(response.error);
        } else if (!response.shopify_checkout_id) {
          reject(throwMessage('shopify checkout id not present'));
        } else {
          resolve(response.shopify_checkout_id);
        }
      },
    });
  });
}
