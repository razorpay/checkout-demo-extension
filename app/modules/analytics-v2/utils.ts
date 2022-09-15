import type { ContextValues } from 'analytics-v2/types';
import { isIframe } from 'common/constants';
import Interface from 'common/interface';
import type { CustomObject } from 'types';
import AnalyticsV2 from './init';

/**
 * sync context between checkoutjs and checkoutframe
 * @param {ContextValues} key
 * @param {unknown} value
 */
function syncContext(key: ContextValues, value: unknown) {
  if (isIframe) {
    Interface.publishToParent('syncContext', { key, value });
  } else {
    Interface.sendMessage('syncContext', { key, value });
  }
}

/**
 * stores last event by type (render/api/behav/integration/metric/debug)
 */
const LAST_EVENT: CustomObject<unknown> = {};

/**
 * sets key value in context
 * @param {ContextValues} key
 * @param {unknown} value
 * @param {boolean} shouldSync
 *
 */
export function setContext(
  key: ContextValues,
  value: unknown,
  shouldSync = true
) {
  AnalyticsV2.setContext(key, value);
  if (shouldSync) {
    syncContext(key, value);
  }
}

/**
 * returns a function which
 * - has type checking on args (eventName -> eventProperties)
 * - handles last event state based on type (lastRender, lastBehav, etc)
 * - triggers core analytics.track with eventName and properties
 */
function getTrackMethod<
  N,
  K extends Record<keyof N, string | { name: string; type: string }>
>(events: K, eventID: keyof K) {
  return function (
    ...props: N[keyof N] extends undefined ? [undefined?] : [N[keyof N]]
  ) {
    const event = events[eventID];
    if (typeof event === 'string') {
      AnalyticsV2.track(event, props[0]);
    } else if (event.name) {
      let eventName = event.name;
      if (event.type) {
        eventName = `${event.type} ${eventName}`;
        LAST_EVENT[event.type] = {
          event: eventName,
          properties: props[0],
        };
      }
      AnalyticsV2.track(eventName, props[0]);
    }
  };
}

/**
 * creates track method for each event in every module ( Refer analytics-v2/readme.md for more details )
 * @param {Record<keyof N, string | { name: string; type: string }} events enum of events for a module
 * @returns an object with key as event and value as the track function for that event
 */
export function createTrackMethodForModule<
  N,
  K extends Record<keyof N, string | { name: string; type: string }>
>(
  events: K
): {
  [T in keyof N]: (
    ...props: N[T] extends undefined ? [undefined?] : [N[T]]
  ) => void;
} {
  const eventIDs = Object.keys(events) as (keyof K)[];
  const returnObj: any = {};
  eventIDs.forEach((eventID: keyof K) => {
    returnObj[eventID] = getTrackMethod(events, eventID);
  });
  return returnObj;
}

/**
 * returns current state of Analytics + last state of each method type ( lastRender, lastApi, etc )
 * @returns {CustomObject<unknown>}
 */
const getState = (): CustomObject<unknown> => {
  return {
    ...AnalyticsV2.getState(),
    last: LAST_EVENT,
  };
};

/**
 * Core Event to setContext, call all track methods, get state
 */
export const EventsV2 = {
  setContext,
  getState,
  createTrackMethodForModule,
};
