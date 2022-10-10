import type {
  Context,
  CustomObject,
  PayloadOptions,
} from 'analytics-v2/library/common/types';
import {
  AnalyticsState,
  Config,
  EventValues,
  PLUGIN_CALLBACK_TYPES,
} from 'analytics-v2/library/analytics-core/types';
import {
  makeContext,
  createPluginsState,
} from 'analytics-v2/library/analytics-core/utils';
import { processEvent } from './utils/events';
import { CORE_EVENTS } from './constants';
import { flatten, unflatten } from 'utils/object';
import BrowserStorage from 'browserstorage';
import { uuid4 } from 'common/uuid';
import {
  createSubscriptionState,
  registerSubscription,
  triggerSubscriptions,
} from './utils/subscription';

export default class Analytics<
  ContextValues extends string | number | symbol = string
> {
  // stores anon id by the name of this key in Storage
  private anonIdKey: string;
  // stores anon id by the name of this key in Storage
  private userIdKey: string;
  // flattened form of Context, for easier key value updation
  private flattenedContext;
  // active state of analytics instance
  private state: AnalyticsState;

  constructor(config: Config) {
    const { app, plugins = [] } = config;

    const context: Context = makeContext();
    this.flattenedContext = flatten(context) as CustomObject<
      ContextValues,
      unknown
    >;

    this.userIdKey = `${app}_user_id`;
    this.anonIdKey = `${app}_anon_id`;

    // create and set anonymous id if it doesn't exist
    if (!BrowserStorage.getItem(this.anonIdKey)) {
      this.setAnonymousId(uuid4());
    }

    this.state = {
      app,
      anonymousId: BrowserStorage.getItem(this.anonIdKey) || '',
      userId: BrowserStorage.getItem(this.userIdKey) || '',
      context,
      plugins: createPluginsState(plugins),
      subscriptions: createSubscriptionState(),
    };

    processEvent({}, this.state, {}, PLUGIN_CALLBACK_TYPES.INITIALIZE);
  }

  /**
   * sets anonymous id in storage and state
   */
  setAnonymousId(anonId: string) {
    BrowserStorage.setItem(this.anonIdKey, anonId);
    if (this.state) {
      this.state.anonymousId = anonId;
      triggerSubscriptions(
        this.state.subscriptions,
        CORE_EVENTS.ANON_ID_UPDATED,
        anonId
      );
    }
  }

  /**
   * sets user id in storage and state
   */
  setUserId(userId: string) {
    BrowserStorage.setItem(this.userIdKey, userId);
    if (this.state) {
      this.state.userId = userId;
      triggerSubscriptions(
        this.state.subscriptions,
        CORE_EVENTS.USER_ID_UPDATED,
        userId
      );
    }
  }

  /**
   * registers callback on event
   * @param eventType event which is to be subscribed
   * @param callback callback to be triggered when event is fired
   */
  on(eventType: EventValues, callback: (payload: unknown) => void): void {
    if (!Object.values(CORE_EVENTS).includes(eventType)) {
      // this event is not supported
      return;
    }

    registerSubscription(this.state.subscriptions, eventType, callback);
  }

  /**
   * sets the key value pair in flattened context
   * @param {string} key key in dot notation format ( eg checkout.env )
   * @param {unknown} value value for the key
   */
  setContext(key: ContextValues, value: unknown): void {
    this.flattenedContext[key] = value;
  }

  /**
   * calls track api with the below payload for each enabled plugin
   * @param {string} eventName name of the event
   * @param {any} properties custom properties to be sent along event
   */
  track(eventName: string, properties?: any, options?: PayloadOptions): void {
    processEvent(
      {
        event: eventName,
        properties,
        userId: this.state.userId,
        anonymousId: this.state.anonymousId,
        context: unflatten(this.flattenedContext) as Context,
        type: PLUGIN_CALLBACK_TYPES.TRACK,
      },
      this.state,
      options,
      PLUGIN_CALLBACK_TYPES.TRACK
    );
  }

  /**
   * calls identify api to link events with user
   * @param userId unique user id to identify the events
   * @param traits user associated traits
   */
  identify(
    userId: string,
    traits?: CustomObject<string, unknown>,
    options?: PayloadOptions
  ): void {
    this.setUserId(userId);
    processEvent(
      {
        anonymousId: this.state.anonymousId,
        userId,
        traits,
        type: PLUGIN_CALLBACK_TYPES.IDENTIFY,
      },
      this.state,
      options,
      PLUGIN_CALLBACK_TYPES.IDENTIFY
    );
  }

  /**
   * - clears out existing user / anon ids from storage
   * - creates a new anonymous id and saves it in state and storage
   */
  reset(): void {
    this.setAnonymousId(uuid4());
    this.setUserId('');
  }

  /**
   * @returns active state of analytics instance
   */
  getState(): AnalyticsState {
    return {
      ...this.state,
      context: unflatten(this.flattenedContext) as Context,
    };
  }
}
