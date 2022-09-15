/**
 * generic custom object with key and type parameter
 */
export type CustomObject<K extends string | number | symbol, T> = {
  [key in K]: T;
};

interface Screen {
  availHeight: number;
  availWidth: number;
  height: number;
  width: number;
  innerHeight: number;
  innerWidth: number;
}

/**
 * meta data of events
 */
export interface Context {
  locale: string;
  platform: string;
  referrer: string;
  screen: Screen;
  traits?: CustomObject<string, string>;
  userAgent: string;
}

/**
 * Event payload passed to plugin API
 */
export interface EventPayload {
  event: string;
  context: Context;
  properties?: CustomObject<string, unknown>;
  userId?: string;
  anonymousId: string;
  originalTimestamp: string;
  sentAt: string;
}

/**
 * Plugin APIs
 */
export type Track = (payload: EventPayload) => Promise<unknown>;
export type Identify = (payload: EventPayload) => Promise<unknown>;
export type Loaded = () => boolean;

/**
 * Plugin config passed to analytics
 */
export interface Plugin {
  name: string;
  loaded: Loaded;
  track?: Track;
  identify?: Identify;
  enabled: boolean;
}

export enum PLUGINS {
  CONSOLE_PLUGIN = 'CONSOLE_PLUGIN',
}
