import { getEventsName } from '../helpers';

const offers = {
  ALERT_SHOW: 'alert:show',
  CALLOUT_SHOW: 'callout:show',
  DOWNTIME_ALERTSHOW: 'alert:show',
} as const;

const events = {
  ...offers,
} as const;

export default getEventsName('downtime', events);
