import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { formatTemplateWithLocale } from 'i18n';
import { pushOverlay } from 'navstack';
import Alert from 'ui/elements/Downtime/Alert.svelte';
import { DOWNTIME_CALLOUT } from 'ui/labels/emandate';

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

export const getDownTimeSeverityMessage = (bankName) =>
  formatTemplateWithLocale(
    DOWNTIME_CALLOUT,
    { instrument: bankName },
    get(locale)
  );
