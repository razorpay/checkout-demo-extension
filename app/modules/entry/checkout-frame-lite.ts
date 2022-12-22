import 'checkout-frame-lite/checkout-frame-init';
import { fetchPreferences } from 'checkout-frame-lite/controller';
import { getQueryParams } from '../utils/_';
import { capture, SEVERITY_LEVELS } from '../error-service';

function loadLitePreferences() {
  const key_id =
    getQueryParams().merchant_key || getQueryParams().magic_shopify_key;

  if (key_id) {
    return fetchPreferences({ key_id });
  }
  return Promise.reject(new Error('merchant_key missing'));
}

function init() {
  const litePrefsPromise = loadLitePreferences().catch((err) => {
    if (typeof err === 'object' && !(err instanceof Error)) {
      err.message = err.message ?? 'lite pref fetch failed';
    }

    capture(err, {
      severity: SEVERITY_LEVELS.S2,
      unhandled: true,
    });
  });

  import(
    /* webpackChunkName: "core" */ '../checkout-frame-lite/checkout-frame-core.js'
  ).then((core) => {
    litePrefsPromise.finally(() => {
      core.default();
    });
  });
}

init();
