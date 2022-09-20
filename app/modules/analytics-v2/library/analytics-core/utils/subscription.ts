import { CORE_EVENTS } from '../constants';
import type { EventKeys, EventValues, Subscriptions } from '../types';

/**
 *
 * @returns an initial state for core events subscriptions
 */
export function createSubscriptionState() {
  return Object.keys(CORE_EVENTS).reduce((acc, curr) => {
    const key = CORE_EVENTS[curr as EventKeys];
    acc[key] = [];
    return acc;
  }, {} as Subscriptions);
}

/**
 * registers new callback in type of subscription provided
 * @param subscriptions array of subscriptions regsitered
 * @param type one of the core events
 * @param callback new callback to be registered
 */
export function registerSubscription(
  subscriptions: Subscriptions,
  type: EventValues,
  callback: (payload: unknown) => void
) {
  subscriptions[type].push(callback);
}

/**
 * triggers callbacks regsitered for core events outside analytics
 * @param subscriptions array of subscriptions registered
 * @param type one of the core events
 * @param payload data to be sent in callback
 */
export function triggerSubscriptions(
  subscriptions: Subscriptions,
  type: EventValues,
  payload: unknown
) {
  subscriptions[type].forEach((callback) => {
    callback(payload);
  });
}
