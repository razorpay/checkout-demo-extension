import {
  IdentifyPayload,
  PayloadOptions,
  PLUGINS,
  QueueType,
  TrackPayload,
} from 'analytics-v2/library/common/types';
import createQueue from 'analytics-v2/library/common/queue';
import { batchRudderRequest, identifyRudderRequest } from './service';
import { BATCH_SIZE, BATCH_TIME_INTERVAL } from './constants';
import { returnAsIs } from 'lib/utils';

const BEACON_SUPPORTED =
  typeof navigator !== 'undefined' &&
  navigator &&
  typeof navigator.sendBeacon === 'function';

/**
 * ======== RUDDERSTACK PLUGIN ========
 *
 * - This Plugin utilises the HTTP APIs provided by Rudderstack ( Track, Identify, Batch )
 * - provides batch support to track events
 * - provides default beacon API support
 * - handles flushing of events on page unload
 * - for more info on the APIs, refer the offical doc (https://www.rudderstack.com/docs/api/http-api/)
 */
export default function ({
  domainUrl,
  key,
}: {
  domainUrl: string;
  key: string;
}) {
  let eventQ: QueueType<TrackPayload> | null = null;
  let useBeacon = true;

  return {
    name: PLUGINS.RUDDERSTACK_PLUGIN,
    /**
     * - initializes the plugin (for sdk, this can be injecting a script)
     * - boots up the queue for batching events
     * - subscribes to unload event to flush out all the events at once
     * - pauses/resumes sending events when network goes offline/online
     */
    initialize: () => {
      eventQ = createQueue(
        (events: TrackPayload[]) => {
          try {
            const date = new Date(Date.now()).toISOString();
            events = events.map((evt: TrackPayload) => {
              return {
                ...(typeof evt === 'object' ? evt : null),
                sentAt: date,
              };
            }) as TrackPayload[];

            batchRudderRequest({
              url: domainUrl,
              key,
              events,
              useBeacon: useBeacon && BEACON_SUPPORTED,
            }).catch(returnAsIs);
          } catch {}
        },
        {
          max: BATCH_SIZE,
          interval: BATCH_TIME_INTERVAL,
        }
      );

      /**
       * flush all events when user is leaving page
       */
      window.addEventListener('beforeunload', () => {
        useBeacon = true;
        eventQ?.flush(true);
      });

      /**
       * halt sending events when network is offline (events are still pushed in queue)
       */
      window.addEventListener('offline', () => {
        eventQ?.pause();
      });

      /**
       * resume sending events when network is online
       */
      window.addEventListener('online', () => {
        eventQ?.resume();
      });
    },

    /**
     * Tracks event via rudderstack api
     * @param {TrackPayload} payload event payload to be sent
     * @param {options} PayloadOptions.immediate if this event has to be batched or not
     */
    track: (payload: TrackPayload, options: PayloadOptions): void => {
      // push in queue
      eventQ?.push(payload);

      if (options.isImmediate) {
        // flush the entire queue if this event is immediate
        eventQ?.flush();
      }
    },

    /**
     * Identifies user from the events
     * @param {IdentifyPayload} payload event payload to be sent
     */
    identify: (payload: IdentifyPayload): void => {
      // Rudderstack doesn't support beacon for identify
      identifyRudderRequest({
        url: domainUrl,
        key,
        payload,
      }).catch(returnAsIs);
    },

    /**
     * whether plugin is loaded or not (always true for rudderstack http plugin)
     * @returns {boolean}
     */
    loaded: (): boolean => true,

    /**
     * whether the plugin is enabled or not, marking it false disables event tracking for plugin
     */
    enabled: true,
  };
}
