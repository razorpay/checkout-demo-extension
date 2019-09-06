import Preferences from 'checkoutstore/preferences.js';
import Downtimes from 'checkoutstore/downtimes.js';

const defaultState = {};

function CheckoutStore() {
  let checkoutStoreState = _Obj.clone(defaultState);

  this.set = state => {
    checkoutStoreState = _Obj.extend(checkoutStoreState, state);
  };

  this.get = function() {
    const preferences = Preferences.get();
    const downtimes = Downtimes.get();
    const optionalFields = {};
    const optionalFieldsList = preferences.optional || [];

    if (optionalFieldsList) {
      optionalFields.contact = optionalFieldsList |> _Arr.contains('contact');
      optionalFields.email = optionalFieldsList |> _Arr.contains('email');
    }

    checkoutStoreState.optional = optionalFields;
    checkoutStoreState.preferences = preferences;
    checkoutStoreState.downtimes = downtimes;
    checkoutStoreState.isPartialPayment =
      preferences.order && preferences.order.partial_payment;

    return checkoutStoreState;
  };
}

export default new CheckoutStore();
