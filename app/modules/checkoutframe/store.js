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
    allowResend: true,
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
};

/**
 * Add default data for each screen.
 */
_Obj.loop(SCREENS, screen => {
  defaultStoreData.screenData[screen] = DEFAULT_SCREEN_DATA[screen] || {};
});

const store = new Store(defaultStoreData);

export default store;
