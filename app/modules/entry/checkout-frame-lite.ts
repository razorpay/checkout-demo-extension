import 'checkout-frame-lite/checkout-frame-init';
import { fetchPreferences } from 'checkout-frame-lite/controller';
import { getQueryParams } from '../utils/_';

function loadLitePreferences() {
  const key_id = getQueryParams().magic_shopify_key;

  if (!key_id) {
    return;
  }

  return new Promise((resolve) => {
    fetchPreferences({ key_id }).then((litePreferences) => {
      resolve(litePreferences);
    });
  });
}

function loadCheckoutFrame() {
  import('../checkout-frame-lite/checkout-frame-core.js');
}

function init() {
  loadLitePreferences();
  loadCheckoutFrame();
}

init();
