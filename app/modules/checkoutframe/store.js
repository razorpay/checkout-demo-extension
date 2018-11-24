/* `node_modules/svelte` is added to the paths */
import { Store } from 'svelte/store.js';

/**
 * All available screens.
 */
const SCREENS = {
  OTP: 'otp',
  SAVED_CARDS: 'saved_cards',
};

/**
 * Default data for each screen.
 */
const DEFAULT_SCREEN_DATA = {
  [SCREENS.OTP]: {
    allowSkip: true,
    maxlength: 6,
    otp: '',
  },
};

/**
 * Default data for the store.
 */
const defaultStoreData = {
  screenData: {},

  Customer: {},
};

/**
 * Add default data for each screen.
 */
_Obj.loop(SCREENS, screen => {
  defaultStoreData.screenData[screen] = DEFAULT_SCREEN_DATA[screen] || {};
});

const store = new Store(defaultStoreData);

export default store;
