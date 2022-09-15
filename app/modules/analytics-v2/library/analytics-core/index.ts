import type { Context, CustomObject } from 'analytics-v2/library/common/types';
import type {
  AnalyticsState,
  Config,
} from 'analytics-v2/library/analytics-core/types';
import {
  makeContext,
  createPluginsState,
} from 'analytics-v2/library/analytics-core/utils';
import { processEvent } from './utils/events';
import { PLUGIN_CALLBACK_TYPES } from './constants';
import { flatten, unflatten } from 'utils/object';
import BrowserStorage from 'browserstorage';
import { uuid4 } from 'common/uuid';

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
      BrowserStorage.setItem(this.anonIdKey, uuid4());
    }

    this.state = {
      app,
      anonymousId: BrowserStorage.getItem(this.anonIdKey) || '',
      userId: BrowserStorage.getItem(this.userIdKey) || '',
      context,
      plugins: createPluginsState(plugins),
    };
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
  track(eventName: string, properties?: any): void {
    const context = unflatten(this.flattenedContext) as Context;
    processEvent(
      {
        event: eventName,
        properties,
        userId: this.state.userId,
        anonymousId: this.state.anonymousId,
        context,
      },
      this.state,
      PLUGIN_CALLBACK_TYPES.TRACK
    );
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
