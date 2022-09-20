export const CORE_EVENTS = {
  /**
   * `userIdUpdated` - Fires when a user id is updated
   */
  USER_ID_UPDATED: 'userIdUpdated',
  /**
   * `anonymousId` - Fires when a anonymous id is updated
   */
  ANON_ID_UPDATED: 'anonymousIdUpdated',
} as const;

/**
 * time gap between polling requests to check if plugin has loaded or not
 */
export const PENDING_QUEUE_INTERVAL = 1000;
