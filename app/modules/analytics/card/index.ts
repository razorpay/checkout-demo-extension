import CardEvents from './card';
import SavedCardEvents from './saved_cards';
import EMIEvents from './emi';
import MiscEvents from './misc';

export default {
  ...CardEvents,
  ...SavedCardEvents,
  ...EMIEvents,
  ...MiscEvents,
};
