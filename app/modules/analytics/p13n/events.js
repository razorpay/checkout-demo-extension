import { getEventsName } from '../helpers';

// Events for home screen
const homeScreen = {
  INSTRUMENTS_SHOWN: 'instruments_shown',
  INSTRUMENTS_LIST: 'instruments:list',
};

// All p13n related events
const events = {
  ...homeScreen,
};

export default getEventsName('p13n', events);
