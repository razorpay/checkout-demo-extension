import type {
  Context,
  EventPayload,
  Plugin,
} from 'analytics-v2/library/common/types';

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
   * queue responsible for sending events in a batch
   */
  eventQ: EventPayload[];
  /**
   * queue responsible for sending events after plugin has loaded
   */
  pendingQ: EventPayload[];
  config: Plugin;
}

export interface AnalyticsState {
  app: string;
  anonymousId: string;
  userId?: string;
  context: Context;
  plugins: { [key: string]: PluginState };
}
