import Analytics from 'analytics-v2/library/analytics-core';
import consolePlugin from 'analytics-v2/library/plugins/console-plugin';
import Interface from 'common/interface';
import type { ContextValues } from './types';

const analytics = new Analytics<ContextValues>({
  app: 'rzp_checkout',
  plugins: [consolePlugin()],
});

/**
 * syncs context between checkoutjs and checkoutframe
 */
Interface.subscribe('syncContext', (event) => {
  let key, value;
  // TODO: to remove this check, interface is exporting inconsistent data from checkoutjs, checkoutframe
  if (event.data) {
    key = event.data.key;
    value = event.data.value;
  } else {
    key = event.key;
    value = event.value;
  }
  analytics.setContext(key, value);
});

export default analytics;
