// type imports
import type { EventPayload } from 'analytics-v2/library/common/types';
import type {
  AnalyticsState,
  PluginState,
} from 'analytics-v2/library/analytics-core/types';

// constant imports
import type { PLUGIN_CALLBACK_TYPES } from 'analytics-v2/library/analytics-core/constants';

// util imports
import { fitlerDisabledPlugins } from 'analytics-v2/library/analytics-core/utils';

/**
 * processes event and sends it to plugin
 * - enriches payload
 * - discards disabled plugins
 * @param {Omit<EventPayload, 'sentAt' | 'originalTimestamp'>} eventData payload of event to sent to plugins
 * @param {AnalyticsState} state current state of analytics instance
 * @param {PLUGIN_CALLBACK_TYPES} type type of plugin callback (track/identify)
 *
 * TODO:
 * - push events to pending queue when plugin is not loaded
 */
export function processEvent(
  eventData: Omit<EventPayload, 'sentAt' | 'originalTimestamp'>,
  state: AnalyticsState,
  type: PLUGIN_CALLBACK_TYPES
) {
  const date = new Date(Date.now()).toISOString();

  const enabledPlugins = fitlerDisabledPlugins(state.plugins);

  enabledPlugins.forEach((plugin: PluginState) => {
    const pluginCallback = plugin.config?.[type];
    if (typeof pluginCallback === 'function') {
      if (plugin?.loaded()) {
        pluginCallback({
          ...eventData,
          originalTimestamp: date,
          sentAt: date,
        });
      } else {
        // TODO: push to pending queue
      }
    }
  });
}
