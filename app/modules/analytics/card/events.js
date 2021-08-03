import { getEventsName } from '../helpers';

// Events for add new card screen
const addNewCardScreen = {
  ADD_NEW_CARD: 'add_new',
};

// All card related events
const events = {
  ...addNewCardScreen,
};

export default getEventsName('card', events);
