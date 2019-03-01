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
  preferences: {},

  // which view should currently be shown
  screen: '',
};

/**
 * Add default data for each screen.
 */
_Obj.loop(SCREENS, screen => {
  defaultStoreData.screenData[screen] = DEFAULT_SCREEN_DATA[screen] || {};
});

const store = new Store(defaultStoreData);

store.compute(
  'isPartialPayment',
  ['preferences'],
  preferences => preferences.order && preferences.order.partial_payment
);

store.compute('optional', ['preferences'], preferences => {
  const optionalObj = {};
  const optionalArray = preferences.optional;
  if (optionalArray) {
    optionalObj.contact = optionalArray |> _Arr.contains('contact');
    optionalObj.email = optionalArray |> _Arr.contains('email');
  }
  return optionalObj;
});

store.compute('contactEmailOptional', ['optional'], optional => {
  return optional.contact && optional.email;
});

store.compute(
  'verticalMethods',
  ['contactEmailOptional', 'isPartialPayment'],
  (contactEmailOptional, isPartialPayment) => {
    return contactEmailOptional || isPartialPayment;
  }
);

export default store;
