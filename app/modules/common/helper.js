import RazorpayConfig from 'common/RazorpayConfig';

export function makeUrl(path = '') {
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
