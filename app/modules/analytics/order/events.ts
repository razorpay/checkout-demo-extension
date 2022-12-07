import { getEventsName } from '../helpers';

const homeScreenEvents = {
  INVALID_TPV: 'invalid_tpv',
} as const;

const events = {
  ...homeScreenEvents,
} as const;

export default getEventsName('order', events);
