import * as TYPES from 'analytics-types';
import Analytics from './analytics';

/**
 * Takes a Object mapping of events name and append prefix
 * @param {String} prefix
 * @param {Object} events
 * @returns {Object}
 */

export const getEventsName = (prefix, events) => {
  if (!prefix) return events;
  const returnObj = {};
  Object.entries(events).forEach((entry) => {
    const [key, value] = entry;
    returnObj[key] = `${prefix}:${value}`;
  });
  return returnObj;
};

/**
 * Iterate Through the analytics types and retuen an Object with tracking methods for each type
 * @returns {Object}
 */

export const getTrackMethods = () => {
  const Events = {};
  Object.values(TYPES).forEach((type) => {
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
 * @param {Object} events
 * @returns Object
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
