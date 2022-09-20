import { CORE_EVENTS } from 'analytics-v2/library/analytics-core/constants';
import {
  createSubscriptionState,
  registerSubscription,
  triggerSubscriptions,
} from '../subscription';

describe('Subscription Utils', () => {
  test('should create correct initial state from CORE EVENTS', () => {
    const subscriptions = createSubscriptionState();

    expect(subscriptions).toMatchObject({
      [CORE_EVENTS.USER_ID_UPDATED]: [],
      [CORE_EVENTS.ANON_ID_UPDATED]: [],
    });
  });

  test('should register a callback/subscription with the event type provided', () => {
    const callback = jest.fn();
    const subscriptions = createSubscriptionState();

    registerSubscription(subscriptions, CORE_EVENTS.ANON_ID_UPDATED, callback);

    expect(subscriptions).toMatchObject({
      [CORE_EVENTS.ANON_ID_UPDATED]: [callback],
    });
  });

  test('should trigger callbacks/subscriptions from the type and payload provided', () => {
    const executionOrder: unknown[] = [];
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const subscriptions = createSubscriptionState();
    registerSubscription(
      subscriptions,
      CORE_EVENTS.ANON_ID_UPDATED,
      (payload: any) => {
        executionOrder.push(1);
        callback1(payload);
      }
    );
    registerSubscription(
      subscriptions,
      CORE_EVENTS.ANON_ID_UPDATED,
      (payload: any) => {
        executionOrder.push(2);
        callback2(payload);
      }
    );

    const payload = {
      hello: 'world',
    };
    triggerSubscriptions(subscriptions, CORE_EVENTS.ANON_ID_UPDATED, payload);

    expect(callback1).toBeCalled();
    expect(callback1).toBeCalledWith(payload);
    expect(callback2).toBeCalled();
    expect(callback2).toBeCalledWith(payload);
    expect(executionOrder).toEqual([1, 2]);
  });
});
