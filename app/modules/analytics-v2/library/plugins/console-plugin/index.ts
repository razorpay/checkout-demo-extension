import {
  IdentifyPayload,
  PLUGINS,
  TrackPayload,
} from 'analytics-v2/library/common/types';

export default function () {
  return {
    name: PLUGINS.CONSOLE_PLUGIN,
    track: (payload: TrackPayload): void => {
      console.log('🚀 ~ CONSOLE-PLUGIN ~ eventName', payload.event);
      console.log('🚀 ~ CONSOLE-PLUGIN ~ payload', payload);
    },
    identify: (payload: IdentifyPayload): void => {
      console.log('🚀 ~ IDENTIFY ~ payload', payload);
    },
    loaded: () => true,
    enabled: true,
  };
}
