import type {
  Context,
  CustomObject,
  Plugin,
  PLUGINS,
} from 'analytics-v2/library/common/types';
import type { PluginState } from 'analytics-v2/library/analytics-core/types';
import { getDevice, getBrowserLocale } from 'common/useragent';

/**
 * initializes and return state for each plugin
 * @param {Plugin[]} plugins
 * @returns {Record<PLUGINS, PluginState>}
 */
export function createPluginsState(
  plugins: Plugin[]
): Record<PLUGINS, PluginState> {
  return plugins.reduce((acc, curr) => {
    acc[curr.name as keyof typeof PLUGINS] = {
      enabled: curr.enabled,
      loaded: curr.loaded,
      pendingQ: null,
      config: curr,
    };
    return acc;
  }, {} as Record<PLUGINS, PluginState>);
}

/**
 * creates and returns default context for events
 * @returns {Context}
 */
export function makeContext(): Context {
  return {
    locale: getBrowserLocale() || '',
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    screen: {
      height: window.screen.height,
      width: window.screen.width,
      availHeight: window.screen.availHeight,
      availWidth: window.screen.availWidth,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    },
    platform: getDevice(),
  };
}

/**
 * returns enabled plugins
 * @param {CustomObject<PluginState>} allPlugins state of all plugins
 * @returns {PluginState[]}
 */
export function fitlerDisabledPlugins(
  allPlugins: CustomObject<PLUGINS | string, PluginState>
): PluginState[] {
  return Object.keys(allPlugins)
    .filter((name: string) => !!allPlugins[name]?.enabled)
    .map((name) => allPlugins[name]);
}
