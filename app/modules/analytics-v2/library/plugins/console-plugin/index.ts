import { EventPayload, PLUGINS } from 'analytics-v2/library/common/types';

export default function () {
  return {
    name: PLUGINS.CONSOLE_PLUGIN,
    track: (payload: EventPayload): Promise<unknown> => {
      console.log('🚀 ~ CONSOLE-PLUGIN ~ eventName', payload.event);
      console.log('🚀 ~ CONSOLE-PLUGIN ~ payload', payload);
      return Promise.resolve({ msg: 'success' });
    },
    loaded: () => true,
    enabled: true,
  };
}
