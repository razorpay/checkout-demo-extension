import Analytics from 'analytics-v2/library/analytics-core';
import Interface from 'common/interface';
import type { ContextValues } from './types';
import { ConsolePlugin, Rudderstack } from './library/plugins';
import { RUDDERSTACK_KEY, RUDDERSTACK_URL } from './constants';

const analytics = new Analytics<ContextValues>({
  app: 'rzp_checkout',
  plugins: [
    ConsolePlugin(),
    {
      ...Rudderstack({
        domainUrl: RUDDERSTACK_URL,
        key: RUDDERSTACK_KEY,
      }),
      enabled: false,
    },
  ],
});

/**
 * sets data in analytics.context received from syncContext event
 */
Interface.subscribe('syncContext', (event) => {
  let key, value;
  if (event.data) {
    key = event.data.key;
    value = event.data.value;
  }
  if (key) {
    analytics.setContext(key, value);
  }
});

/**
 * sets anonId in analytics state received from syncAnonymousId event
 */
Interface.subscribe(
  'syncAnonymousId',
  (event: { data: { anonymousId: string } }) => {
    if (event.data?.anonymousId) {
      analytics.setAnonymousId(event.data.anonymousId);
    }
  }
);

/**
 * sets userId in analytics state received from syncUserId event
 */
Interface.subscribe('syncUserId', (event: { data: { userId: string } }) => {
  if (event.data?.userId) {
    analytics.setUserId(event.data.userId);
  }
});

export default analytics;
