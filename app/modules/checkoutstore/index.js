import Preferences from 'checkoutstore/preferences.js';
import Downtimes from 'checkoutstore/downtimes.js';

function CheckoutStore() {
  let checkoutStoreState = {};

  this.set = state => {
    checkoutStoreState = state;
  };

  this.get = function() {
    let preferences = Preferences.get();
    let downtimes = Downtimes.get();
    let optionalObj = {};
    let optionalArray = preferences.optional;

    if (optionalArray) {
      optionalObj.contact = optionalArray |> _Arr.contains('contact');
      optionalObj.email = optionalArray |> _Arr.contains('email');
    }

    checkoutStoreState.optional = optionalObj;
    checkoutStoreState.preferences = preferences;
    checkoutStoreState.downtimes = downtimes;
    checkoutStoreState.isPartialPayment =
      preferences.order && preferences.order.partial_payment;

    return checkoutStoreState;
  };
}

export default new CheckoutStore();
