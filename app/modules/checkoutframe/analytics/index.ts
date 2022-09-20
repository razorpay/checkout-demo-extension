import analyticsV2, { EventsV2 } from 'analytics-v2';
import Interface from 'common/interface';

/**
 * starts listening to user/anon id updates and syncs with checkoutjs
 */
export function startAnalyticsSyncing() {
  const { userId, anonymousId } = EventsV2.getState();

  // sync initial state before listener was attached
  if (anonymousId) {
    Interface.publishToParent('syncAnonymousId', { anonymousId });
  }

  if (userId) {
    Interface.publishToParent('syncUserId', { userId });
  }

  // listen to anon id updates
  analyticsV2.on('anonymousIdUpdated', (anonymousId) => {
    Interface.publishToParent('syncAnonymousId', { anonymousId });
  });

  // listen to user id updates
  analyticsV2.on('userIdUpdated', (userId) => {
    Interface.publishToParent('syncUserId', { userId });
  });
}
