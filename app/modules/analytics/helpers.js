import * as TYPES from 'analytics-types';
import Analytics from './base-analytics';

/**
 * Takes a Object mapping of events name and append prefix
 * @param {String} prefix
 * @param {Object} events
 * @returns {Object}
 */

export const getEventsName = (prefix, events) => {
  if (!prefix) {
    return events;
  }
  const returnObj = {};
  Object.keys(events).forEach((key) => {
    const value = events[key];
    if (key === '__PREFIX' && value === '__PREFIX') {
      // this will convert to toUpperCase(prefix) : prefix
      returnObj[prefix.toUpperCase()] = `${prefix}`;
      return;
    }
    returnObj[key] = `${prefix}:${value}`;
  });
  return returnObj;
};

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
  const Events = {};
  Object.keys(TYPES).forEach((key) => {
    const type = TYPES[key];
    const methodName = `Track${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    Events[methodName] = function (eventName, data) {
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
export const addAnalyticsMethods = (events) => {
  return {
    ...events,
    setMeta: Analytics.setMeta,
    removeMeta: Analytics.removeMeta,
    updateRequestIndex: Analytics.updateRequestIndex,
    setR: Analytics.setR,
  };
};
