import { getEventsName } from '../helpers';

// Events for add new card screen
const addNewCardScreen = {
  /** Add new Card screen mount */
  ADD_NEW_CARD: 'add_new',
};

const cardScreen = {
  APP_SELECT: 'app:select',
  ADD_CARD_SCREEN_RENDERED: '1cc_payments_add_new_card_screen_loaded',
  SAVED_CARD_SCREEN_RENDERED: '1cc_payments_saved_card_screen_loaded',
};

// All card related events
const events = {
  ...addNewCardScreen,
  ...cardScreen,
};

export const SAVED_CARD_EVENTS = {
  SCREEN_LOAD: 'checkoutSavedCardScreenLoaded',
};

export default getEventsName('card', events);
