import 'checkout-frame-lite/checkout-frame-init';
import { fetchPreferences } from 'checkout-frame-lite/controller';
import { getQueryParams } from '../utils/_';

function loadLitePreferences() {
  const key_id = getQueryParams().magic_shopify_key;

  if (key_id) {
    return fetchPreferences({ key_id });
  }
}

function init() {
  const litePrefsPromise = loadLitePreferences();
  import('../checkout-frame-lite/checkout-frame-core.js').then((core) => {
    litePrefsPromise?.finally(() => {
      core.default();
    });
  });
}

init();
