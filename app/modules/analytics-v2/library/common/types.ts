import type { PLUGIN_CALLBACK_TYPES } from 'analytics-v2/library/analytics-core/types';

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
 * Event payload passed to plugin Track API
 */
export interface TrackPayload {
  event: string;
  context: Context;
  properties?: CustomObject<string, unknown>;
  userId?: string;
  anonymousId: string;
  originalTimestamp: string;
  type: PLUGIN_CALLBACK_TYPES.TRACK;
}

/**
 * Event payload passed to plugin Identify API
 */
export interface IdentifyPayload {
  userId: string;
  anonymousId: string;
  traits?: CustomObject<string, unknown>;
  type: PLUGIN_CALLBACK_TYPES.IDENTIFY;
}

/**
 * Plugin APIs
 */
export type Track = (payload: TrackPayload, options: PayloadOptions) => void;
export type Identify = (
  payload: IdentifyPayload,
  options: PayloadOptions
) => void;
export type Initialize = (
  payload: CustomObject<string, unknown>,
  options: PayloadOptions
) => void;
export type Loaded = () => boolean;

export interface QueueType<K> {
  flush: (flushAll?: boolean) => void;
  push: (data: K) => void;
  size: () => number;
  pause: (toFlush?: boolean) => void;
  resume: () => void;
}

export interface QueueOptions<K> {
  /**
   * max limit for items in a batch
   */
  max?: number;
  /**
   * interval in ms for time period between queue flush
   */
  interval?: number;
  /**
   * initial queue array
   */
  initial?: K[];
  /**
   * callback triggered when queue is empty
   */
  onEmpty?: () => void;
  /**
   * callback triggered when queue is paused
   */
  onPause?: (queue: K[]) => void;
}

/**
 * Plugin config passed to analytics
 */
export interface Plugin {
  name: string;
  loaded: Loaded;
  track?: Track;
  identify?: Identify;
  initialize?: Initialize;
  enabled: boolean;
}

/**
 * total set of available Plugins
 */
export enum PLUGINS {
  CONSOLE_PLUGIN = 'CONSOLE_PLUGIN',
  RUDDERSTACK_PLUGIN = 'RUDDERSTACK_PLUGIN',
}

/**
 * extra options sent along payload in every API (track, identify, initialize)
 */
export interface PayloadOptions {
  isImmediate?: boolean;
}
