import Preferences from 'checkoutstore/preferences';
import Downtimes from 'checkoutstore/downtimes';

const defaultState = {};

function CheckoutStore(base) {
  let checkoutStoreState = {};

  this.set = state => {
    checkoutStoreState |> _Obj.extend({} |> _Obj.extend(state));
  };

  this.get = function() {
    const storeState = _Obj.extend({}, checkoutStoreState);
    const preferences = Preferences.get();
    const downtimes = Downtimes.get();
    const optionalFields = {};
    const optionalFieldsList = preferences.optional || [];

    if (optionalFieldsList) {
      optionalFields.contact = optionalFieldsList |> _Arr.contains('contact');
      optionalFields.email = optionalFieldsList |> _Arr.contains('email');
    }

    storeState.optional = optionalFields;
    storeState.isPartialPayment =
      preferences.order && preferences.order.partial_payment;

    storeState.contactEmailOptional =
      storeState.optional.contact && storeState.optional.email;
    storeState.verticalMethods =
      storeState.contactEmailOptional || storeState.isPartialPayment;

    storeState.preferences = preferences;
    storeState.downtimes = downtimes;

    return storeState;
  };

  this.set(base);
}

export default new CheckoutStore(defaultState);
