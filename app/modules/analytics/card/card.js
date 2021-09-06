import { getEventsName } from '../helpers';

// Events for add new card screen
const addNewCardScreen = {
  /** Add new Card screen mount */
  ADD_NEW_CARD: 'add_new',
};

const cardScreen = {
  APP_SELECT: 'app:select',
};
// All card related events
const events = {
  ...addNewCardScreen,
  ...cardScreen,
};

export default getEventsName('card', events);
