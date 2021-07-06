import { getEventsName } from '../helpers';

const homeScreenEvents = {
  INVALID_TPV: 'invalid_tpv',
};

const events = {
  ...homeScreenEvents,
};

export default getEventsName('order', events);
