import RazorpayConfig from 'common/RazorpayConfig';
import { appendParamsToUrl } from 'common/form';
import { Track } from 'analytics';

export function isStandardCheckout() {
  return ['checkoutjs', 'hosted'].includes(Track.props.library);
}

/**
 * Build edge proxy endpoint url with session token
 * Edge has created proxy rotes for whitelisted api routes. This has a path prefix of `standard_checkout/`
 * This prefix is only on edge. When this endpoint is hit, edge calls the mapped url for this endpoint
 * Example:
 * https://api.razorpay.com/v1/standard_checkout/checkout/rewards -> https://api.razorpay.com/v1/checkout/rewards
 * Here `v1/standard_checkout/checkout/rewards` is mapped to `v1/checkout/rewards`. When checkout hits
 * `v1/standard_checkout/checkout/rewards`, edge forwards the request to `v1/checkout/rewards`
 * and then it is resolved. Edge also removes the `session_token` query param for
 * these proxy routes.
 *
 * @param {string} path
 * @param {string} session_token
 * @returns {string} - url with session token attached as query param
 */
function makeSessionTokenUrl(path = '', session_token) {
  const url =
    RazorpayConfig.api + RazorpayConfig.version + 'standard_checkout/' + path;

  return appendParamsToUrl(url, {
    session_token,
  });
}

/**
 * Build api endpoint url with path
 * @param {string} path
 * @param {boolean} applySessionFlow - should hit edge proxy route with session token?
 * @returns {string} - url
 */
export function makeUrl(path = '', applySessionFlow = true) {
  // We are only building the session token url:
  // - for standard checkout as session_token will only be present in standard checkout
  //   and custom checkout should not be impacted.
  // - when session token is actually set. That means the session token flow is enabled on edge
  //   and edge will strip off the query param. This is just a precaution for when edge changes
  //   are disabled, checkout changes should be disabled too.
  // - when we choose to make url via session flow. If applySessionFlow is false that means we don't
  //   want to use edge proxy routes here and use original api route.
  if (isStandardCheckout() && global.session_token && applySessionFlow) {
    return makeSessionTokenUrl(path, global.session_token);
  }

  return RazorpayConfig.api + RazorpayConfig.version + path;
}

export const backendEntityIds = [
  'key',
  'order_id',
  'invoice_id',
  'subscription_id',
  'auth_link_id',
  'payment_link_id',
  'contact_id',
  'checkout_config_id',
];

export function makeAuthUrl(r, url) {
  url = makeUrl(url);

  for (var i = 0; i < backendEntityIds.length; i++) {
    var prop = backendEntityIds[i];
    var value = r.get(prop);
    if (prop === 'key') {
      prop = 'key_id';
    } else {
      prop = 'x_entity_id';
    }
    if (value) {
      var account_id = r.get('account_id');
      if (account_id) {
        value += '&account_id=' + account_id;
      }
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + prop + '=' + value;
    }
  }
  return url;
}
