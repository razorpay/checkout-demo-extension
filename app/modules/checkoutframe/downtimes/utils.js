import { pushOverlay } from 'navstack';
import Alert from 'ui/elements/Downtime/Alert.svelte';
export const checkForDowntime = function (payload) {
  const downtimeSeverity = payload.downtimeSeverity;
  const downtimeInstrument = payload.downtimeInstrument;

  if (downtimeSeverity === 'high') {
    return downtimeInstrument;
  }
  return false;
};

export const showDowntimeAlert = function (downtimeInstrument) {
  pushOverlay({
    component: Alert,
    props: {
      instrument: downtimeInstrument,
    },
  });
};
