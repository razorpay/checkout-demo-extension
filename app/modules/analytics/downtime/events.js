import { getEventsName } from '../helpers';

const offers = {
  "ALERT_SHOW": "alert:show",
  "CALLOUT_SHOW": "callout:show",
}

const events = {
  ...offers
}

export default getEventsName("downtime", events);