import type {
  AnalyticsState,
  CallbackPayloadMap,
  PluginState,
} from 'analytics-v2/library/analytics-core/types';
import { fitlerDisabledPlugins } from 'analytics-v2/library/analytics-core/utils';
import createQueue from 'analytics-v2/library/common/queue';
import type { PayloadOptions } from 'analytics-v2/library/common/types';
import { PENDING_QUEUE_INTERVAL } from '../constants';

/**
 * handles pending queue
 * - pushes event in pendingQ of plugin
 * - starts a queue
 * - polls if plugin is loaded, if yes triggers plugin API else pushes back in queue
 * @param {PluginState} plugin
 * @param {any} payload
 * @param {PayloadOptions} options
 * @param {keyof CallbackPayloadMap} type
 */
function handlePendingEvents(
  plugin: PluginState,
  payload: any,
  options: PayloadOptions,
  type: keyof CallbackPayloadMap
) {
  const pluginCallback = plugin.config?.[type];
  if (!plugin.pendingQ) {
    // create a new queue for plugin and push events triggered before plugin loaded
    plugin.pendingQ = createQueue(
      (events: any[]) => {
        events.forEach((payload) => {
          if (!plugin.loaded()) {
            // plugin is still not loaded, push the event back in queue
            plugin.pendingQ?.push(payload);
          } else if (pluginCallback) {
            pluginCallback(payload, options);
          }
        });
      },
      {
        interval: PENDING_QUEUE_INTERVAL,
      }
    );
  }
  plugin.pendingQ.push(payload);
}

/**
 * processes event and sends it to plugin
 * - enriches payload
 * - discards disabled plugins
 * @param eventData payload of event to sent to plugins
 * @param {AnalyticsState} state current state of analytics instance
 * @param {PLUGIN_CALLBACK_TYPES} type type of plugin callback (track/identify)
 *
 */
export function processEvent<K extends keyof CallbackPayloadMap>(
  eventData: CallbackPayloadMap[K],
  state: AnalyticsState,
  options: PayloadOptions = { isImmediate: false },
  type: K
) {
  const date = new Date(Date.now()).toISOString();
  const payload: any = {
    ...eventData,
    originalTimestamp: date,
  };
  const enabledPlugins = fitlerDisabledPlugins(state.plugins);

  enabledPlugins.forEach((plugin: PluginState) => {
    const pluginCallback = plugin.config?.[type];
    if (typeof pluginCallback === 'function') {
      if (plugin?.loaded()) {
        // trigger plugin callback for the type
        pluginCallback(payload, options);
      } else {
        handlePendingEvents(plugin, payload, options, type);
      }
    }
  });
}
