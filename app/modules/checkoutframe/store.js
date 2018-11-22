/* `node_modules/svelte` is added to the paths */
import { Store } from 'svelte/store.js';

/**
 * All available screens.
 */
const SCREENS = {
  OTP: 'otp',
};

/**
 * Default data for each screen.
 */
const DEFAULT_SCREEN_DATA = {
  [SCREENS.OTP]: {
    allowSkip: true,
    otp: '',
  },
};

/**
 * Default data for the store.
 */
const defaultStoreData = {};

/**
 * Add default data for each screen.
 */
defaultStoreData.screenData = {};
_Obj.loop(SCREENS, screen => {
  defaultStoreData.screenData[screen] = DEFAULT_SCREEN_DATA[screen] || {};
});

const store = new Store(defaultStoreData);

export default store;
