import { composeStore } from 'checkoutstore/create';
import Screens from 'checkoutstore/screens';
import Preferences from 'checkoutstore/preferences.js';
import SessionStore from 'checkoutstore/session.js';

const CheckoutStore = composeStore({
  preferences: Preferences,
  screens: Screens,
  session: SessionStore,
});

CheckoutStore.compute(
  'isPartialPayment',
  ['preferences'],
  preferences => preferences.order && preferences.order.partial_payment
);

CheckoutStore.compute('optional', ['preferences'], preferences => {
  const optionalObj = {};
  const optionalArray = preferences.optional;
  if (optionalArray) {
    optionalObj.contact = optionalArray |> _Arr.contains('contact');
    optionalObj.email = optionalArray |> _Arr.contains('email');
  }
  return optionalObj;
});

CheckoutStore.compute('contactEmailOptional', ['optional'], optional => {
  return optional.contact && optional.email;
});

CheckoutStore.compute(
  'verticalMethods',
  ['contactEmailOptional', 'isPartialPayment'],
  (contactEmailOptional, isPartialPayment) => {
    return contactEmailOptional || isPartialPayment;
  }
);

export default CheckoutStore;
