import { getEventsName } from '../helpers';

// Events for home screen
const homeScreen = {
  METHODS_SHOWN: 'methods:shown',
  METHODS_HIDE: 'methods:hide',
  P13N_EXPERIMENT: 'p13n:experiment',
  LANDING: 'landing',
  PROCEED: 'proceed',
};

// All card related events
const events = {
  ...homeScreen,
};

export default getEventsName('home', events);
