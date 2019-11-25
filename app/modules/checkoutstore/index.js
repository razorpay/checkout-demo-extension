import Preferences from 'checkoutstore/preferences';
import Downtimes from 'checkoutstore/downtimes';
import { getSession } from 'sessionmanager';

const defaultState = {};

function CheckoutStore(base) {
  let checkoutStoreState = {};

  this.set = state => {
    checkoutStoreState |> _Obj.extend({} |> _Obj.extend(state));
  };

  this.get = function() {
    const session = getSession();

    const storeState = _Obj.extend({}, checkoutStoreState);
    const preferences = Preferences.get();
    const downtimes = Downtimes.get();
    const optionalFields = {};
    const optionalFieldsList = preferences.optional || [];
    const hiddenFields = {};

    if (optionalFieldsList) {
      optionalFields.contact = optionalFieldsList |> _Arr.contains('contact');
      optionalFields.email = optionalFieldsList |> _Arr.contains('email');
    }

    hiddenFields.contact =
      optionalFields.contact && session.get('hidden.contact');
    hiddenFields.email = optionalFields.email && session.get('hidden.email');

    storeState.optional = optionalFields;
    storeState.hidden = hiddenFields;
    storeState.isPartialPayment =
      preferences.order && preferences.order.partial_payment;

    storeState.contactEmailOptional =
      storeState.optional.contact && storeState.optional.email;
    storeState.contactEmailHidden =
      storeState.hidden.contact && storeState.hidden.email;
    storeState.verticalMethods =
      storeState.contactEmailOptional || storeState.isPartialPayment;

    storeState.preferences = preferences;
    storeState.downtimes = downtimes;

    return storeState;
  };

  this.set(base);
}

export default new CheckoutStore(defaultState);
