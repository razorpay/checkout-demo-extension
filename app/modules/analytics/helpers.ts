import * as TYPES from 'analytics-types';
import Analytics from './base-analytics';
import type { GenerateTrackProp, GetEventNameType } from './types';

/**
 * Takes a Object mapping of events name and append prefix
 * @param {String} prefix
 * @param {Object} events
 * @returns {Object}
 */
export function getEventsName<
  T extends Record<string, string>,
  P extends string
>(prefix: P, events: T): GetEventNameType<T, P>;
export function getEventsName<
  T extends Record<string, string>,
  P extends undefined
>(prefix: P, events: T): T;
export function getEventsName<
  T extends Record<string, string>,
  P extends string
>(prefix: P, events: T): GetEventNameType<T, P> | T {
  if (!prefix) {
    return events;
  }
  const returnObj: GetEventNameType<T, P> = {} as any;
  Object.keys(events).forEach((key: keyof T) => {
    const value = events[key];
    if (key === '__PREFIX' && value === '__PREFIX') {
      // this will convert to toUpperCase(prefix) : prefix
      (returnObj as any)[prefix.toUpperCase()] = `${prefix}`;
      return;
    }
    (returnObj as any)[key] = `${prefix}:${value}`;
  });
  return returnObj;
}

/**
 * Iterate Through the analytics types and return an Object with tracking methods for each type
 * @returns {{
 *  Track: (eventName: string, data?: { [key in string]: unknown }): void,
 *  TrackBehav: (eventName: string, data?: { [key in string]: unknown }): void,
 *  TrackRender: (eventName: string, data?: { [key in string]: unknown }): void,
 *  TrackMetric: (eventName: string, data?: { [key in string]: unknown }): void,
 *  TrackDebug: (eventName: string, data?: { [key in string]: unknown }): void,
 *  TrackIntegration: (eventName: string, data?: { [key in string]: unknown }): void,
 *  removeMeta: (...args?: unknown[]): void,
 *  setMeta: (...args?: unknown[]): void,
 *  updateRequestIndex: (...args?: unknown[]): void,
 *  setR: (...args?: unknown[]): void,
 * }}
 */
export const getTrackMethods = () => {
  const Events: GenerateTrackProp = {} as GenerateTrackProp;
  Object.keys(TYPES).forEach((key) => {
    const type = TYPES[key as keyof typeof TYPES];
    const methodName = `Track${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    (Events as any)[methodName] = function (eventName: string, data: any) {
      Analytics.track(eventName, {
        type,
        data,
      });
    };
  });
  Events.Track = function (eventName, data) {
    Analytics.track(eventName, {
      data,
    });
  };
  return Events;
};

/**
 * Takes the evets Obj and analytics methods to it
 * @param {Events} events
 * @returns {Events}
 */
export const addAnalyticsMethods = (
  events: GenerateTrackProp
): GenerateTrackProp & {
  removeMeta: typeof Analytics.removeMeta;
  setMeta: typeof Analytics.setMeta;
  setR: typeof Analytics.setR;
  updateRequestIndex: (name: string) => number;
} => {
  return {
    ...events,
    setMeta: Analytics.setMeta,
    removeMeta: Analytics.removeMeta,
    updateRequestIndex: (...args) => Analytics.updateRequestIndex(...args),
    setR: Analytics.setR,
  };
};
