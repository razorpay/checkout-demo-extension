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
    const readonlyFields = {};

    if (optionalFieldsList) {
      optionalFields.contact = optionalFieldsList |> _Arr.contains('contact');
      optionalFields.email = optionalFieldsList |> _Arr.contains('email');
    }

    hiddenFields.contact =
      optionalFields.contact && session.get('hidden.contact');
    hiddenFields.email = optionalFields.email && session.get('hidden.email');

    readonlyFields.contact =
      session.get('readonly.contact') && session.get('prefill.contact');
    readonlyFields.email =
      session.get('readonly.email') && session.get('prefill.email');

    const prefill = {
      contact: session.get('prefill.contact'),
      email: session.get('prefill.email'),
    };

    storeState.prefill = prefill;
    storeState.optional = optionalFields;
    storeState.hidden = hiddenFields;
    storeState.readonly = readonlyFields;
    storeState.isPartialPayment =
      preferences.order && preferences.order.partial_payment;

    storeState.address = _Obj.getSafely(
      preferences,
      'features.customer_address',
      false
    );

    storeState.contactEmailOptional =
      storeState.optional.contact && storeState.optional.email;
    storeState.contactEmailHidden =
      storeState.hidden.contact && storeState.hidden.email;
    storeState.contactEmailReadonly =
      storeState.readonly.contact && storeState.readonly.email;

    storeState.verticalMethods =
      storeState.contactEmailOptional || storeState.isPartialPayment;

    storeState.preferences = preferences;
    storeState.downtimes = downtimes;

    return storeState;
  };

  this.set(base);
}

export default new CheckoutStore(defaultState);
