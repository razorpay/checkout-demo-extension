import type {
  Context,
  CustomObject,
  Plugin,
  IdentifyPayload,
  TrackPayload,
  QueueType,
} from 'analytics-v2/library/common/types';
import type { CORE_EVENTS } from './constants';

export interface Config {
  /**
   * name of the app, currently being used as a prefix to store anon/user ids
   */
  app: string;
  plugins?: Plugin[];
}

export interface PluginState {
  /**
   * whether plugin is loaded or not ( always true for HTTP plugins )
   */
  loaded: () => boolean;
  /**
   * whether plugin is enabled or not ( no events are tracked for disabled plugin )
   */
  enabled: boolean;
  /**
   * queue responsible for sending events after plugin has loaded
   */
  pendingQ: null | QueueType<{
    payload: TrackPayload | IdentifyPayload | CustomObject<string, unknown>;
    type: PLUGIN_CALLBACK_TYPES;
  }>;
  config: Plugin;
}

export interface Subscriptions {
  [key: string]: ((payload: unknown) => void)[];
}

export interface AnalyticsState {
  app: string;
  anonymousId: string;
  userId?: string;
  context: Context;
  plugins: { [key: string]: PluginState };
  subscriptions: Subscriptions;
}

export const enum PLUGIN_CALLBACK_TYPES {
  TRACK = 'track',
  IDENTIFY = 'identify',
  INITIALIZE = 'initialize',
}

export interface CallbackPayloadMap {
  [PLUGIN_CALLBACK_TYPES.TRACK]: Omit<TrackPayload, 'originalTimestamp'>;
  [PLUGIN_CALLBACK_TYPES.IDENTIFY]: Omit<IdentifyPayload, 'originalTimestamp'>;
  [PLUGIN_CALLBACK_TYPES.INITIALIZE]: CustomObject<string, unknown>;
}

export type EventKeys = keyof typeof CORE_EVENTS;
export type EventValues = typeof CORE_EVENTS[EventKeys];

export type PluginOptions = {
  enable: boolean;
};
