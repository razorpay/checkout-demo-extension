import { makeAuthUrl } from 'common/makeAuthUrl';
import fetch from 'utils/fetch';

export function updateShopifyAbandonedCartUrl(order_id) {
  fetch.post({
    url: makeAuthUrl('1cc/shopify/abandon_checkout'),
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    data: JSON.stringify({ order_id }),
  });
}
