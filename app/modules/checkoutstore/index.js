import { writable } from 'svelte/store';
import { getDowntimes as _getDowntimes } from 'checkoutframe/downtimes';
import { makeAuthUrl as _makeAuthUrl } from 'common/Razorpay';
import { displayAmount } from 'common/currency';

let razorpayInstance, preferences;
export const razorpayInstanceStore = writable();
// We're going to remember payment errors in this variable.
export const methodErrors = writable({});

/**
 * Returns an ID for a payment payload.
 * @param data Payment payload
 * @returns {string} id
 */
export function getIdForPaymentPayload(data) {
  if (data.method === 'app' && data.provider) {
    return data.method + '_' + data.provider;
  }
}

/**
 * Remember the error for a particular method.
 * @param data Payment payload
 * @param error Error payload from API
 */
export function setMethodErrorForPayload(data, error) {
  const id = getIdForPaymentPayload(data);
  if (!id) {
    return;
  }
  methodErrors.update(obj => ((obj[id] = error), obj));
}

/**
 * Returns whether or not we should show
 * the default overlay error UI for
 * a payment payload and error combination.
 * @param data
 * @param error
 * @returns {boolean}
 */
export function shouldShowDefaultError(data, error) {
  if (data?.method === 'app' && data.provider === 'cred') {
    if (error?.source === 'customer') {
      return false;
    }
  }

  return true;
}

export function setRazorpayInstance(_razorpayInstance) {
  razorpayInstance = _razorpayInstance;
  preferences = razorpayInstance.preferences;
  razorpayInstanceStore.set(_razorpayInstance);
  if (isIRCTC()) {
    razorpayInstance.set('theme.image_frame', false);
  }
}
export const makeAuthUrl = url => _makeAuthUrl(razorpayInstance, url);

const IRCTC_KEYS = [
  'rzp_test_mZcDnA8WJMFQQD',
  'rzp_live_ENneAQv5t7kTEQ',
  'rzp_test_kD8QgcxVGzYSOU',
  'rzp_live_alEMh9FVT4XpwM',
];

export const isIRCTC = () => IRCTC_KEYS |> _Arr.contains(getOption('key'));

export const getDisplayAmount = am => displayAmount(razorpayInstance, am);
export const getMerchantMethods = () => preferences.methods;
export const getRecurringMethods = () => preferences.methods.recurring;
export const getMerchantOrder = () => preferences.order;
export const getMerchantOffers = () => preferences.offers;
export const isOfferForced = () => preferences.force_offer;
export const getDowntimes = () => _getDowntimes(preferences);
export const isCustomerFeeBearer = () => preferences.fee_bearer;
export const getCheckoutConfig = () => preferences.checkout_config;

const optionGetter = option => () => getOption(option);
export const getOption = option => razorpayInstance.get(option);
export const setOption = (option, value) => razorpayInstance.set(option, value);
export const getCallbackUrl = optionGetter('callback_url');
export const getCardFeatures = iin => razorpayInstance.getCardFeatures(iin);
export const getCardCurrencies = ({ iin, tokenId, cardNumber }) =>
  razorpayInstance.getCardCurrencies({
    iin,
    tokenId,
    cardNumber,
    amount: getAmount(),
    currency: getCurrency(), // Entity currency
  });

const entityWithAmount = ['order', 'invoice', 'subscription'];
const getEntityWithAmount = () =>
  entityWithAmount |> _Arr.find(entity => preferences |> _Obj.hasProp(entity));

// @TODO return amount based on partial payment
// @TODO use everywhere instead of session.get('amount')
// @TODO start using entityWithAmount
export const getAmount = () => {
  return getOption('amount');
};
export const getName = () => {
  return getOption('name');
};

// @TODO use everywhere
export const getCurrency = () => {
  return getEntityWithAmount()?.currency || getOption('currency');
};

export const getOrderId = optionGetter('order_id');
export const getPrefilledContact = optionGetter('prefill.contact');
export const getPrefilledEmail = optionGetter('prefill.email');
export const getPrefilledName = optionGetter('prefill.name');
export const getPrefilledCardNumber = optionGetter('prefill.card[number]');
export const getPrefilledVPA = optionGetter('prefill.vpa');

export function hasFeature(feature, fallbackValue) {
  return _Obj.getSafely(preferences, `features.${feature}`, fallbackValue);
}

export function isPayout() {
  return getOption('payout');
}

export function isAddressEnabled() {
  return hasFeature('customer_address', false);
}

export function isDCCEnabled() {
  return hasFeature('dcc', false) && getCurrency() === 'INR';
}

export function isContactOptional() {
  return preferences.optional || [] |> _Arr.contains('contact');
}

export function isEmailOptional() {
  return preferences.optional || [] |> _Arr.contains('email');
}

export function getOptionalObject() {
  return {
    contact: isContactOptional(),
    email: isEmailOptional(),
  };
}

export function isContactEmailOptional() {
  return isContactOptional() && isEmailOptional();
}

export function isContactHidden() {
  return isContactOptional() && getOption('hidden.contact');
}

export function isEmailHidden() {
  return isEmailOptional() && getOption('hidden.email');
}

export function isContactEmailHidden() {
  return isContactHidden() && isEmailHidden();
}

export function isContactReadOnly() {
  return getOption('readonly.contact') && getOption('prefill.contact');
}

export function isEmailReadOnly() {
  return getOption('readonly.email') && getOption('prefill.email');
}

export function isContactEmailReadOnly() {
  return isContactReadOnly() && isEmailReadOnly();
}

export function isNameReadOnly() {
  return getOption('readonly.name') && getOption('prefill.name');
}

export function isPartialPayment() {
  return preferences.order && preferences.order.partial_payment;
}

export function isASubscription(method = null) {
  if (!preferences.subscription) {
    return false;
  }

  // return true if no method is specified. This is a subscription session
  if (!method) {
    return true;
  } else {
    return preferences.subscription[method] !== false;
  }
}

export function getSubscription() {
  return preferences.subscription;
}

export function isRecurring() {
  if (
    getOption('prefill.method') === 'emandate' &&
    (preferences.methods || {}).recurring
  ) {
    return true;
  }
  return preferences.subscription || getOption('recurring');
}

export function isStrictlyRecurring() {
  return isRecurring() && getOption('recurring') !== 'preferred';
}

export function shouldRememberCustomer() {
  if (isRecurring()) {
    return true;
  }
  if (!navigator.cookieEnabled) {
    return false;
  }
  if (!getOption('features.cardsaving')) {
    return false;
  }

  // if merchant passed options.remember_customer as true,
  // that take precedence over optional contact
  // it should not be the case
  // @TODO fix savedcard tests and remove below condition
  if (razorpayInstance.get().remember_customer === true) {
    return true;
  }
  if (isContactOptional() && !getPrefilledContact()) {
    return false;
  }
  return getOption('remember_customer');
}

export function shouldStoreCustomerInStorage() {
  const globalCustomer = preferences && preferences.global;
  const rememberCustomer = razorpayInstance.get().remember_customer;

  return globalCustomer && rememberCustomer;
}

export function shouldSeparateDebitCard() {
  return getOption('theme.debit_card');
}

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function getBanks() {
  return preferences.methods.netbanking;
}

function getConfigFromOptions() {
  if (_.isNull(getOption('config'))) {
    return null;
  }

  /**
   * Only certain keys are allowed to be passed from options
   * For example, restrictions aren't allowed
   */
  const config = {
    display: getOption('config.display'),
  };

  return config;
}

export function getMerchantConfig() {
  const configFromOptions = getConfigFromOptions();
  const configFromPreferences = getCheckoutConfig();

  const displayFromOptions = _Obj.getSafely(configFromOptions, 'display');
  const displayFromPreferences = _Obj.getSafely(
    configFromPreferences,
    'display'
  );

  // Restrictions can only come from preferences
  const restrictions = {
    config: _Obj.getSafely(configFromPreferences, 'restrictions'),
    source: 'preferences',
  };

  let display = {};

  if (_.isNull(displayFromOptions)) {
    // Setting config.display as null allows you to disable the display configuration
    display = {
      config: null,
      source: 'options',
    };
  } else {
    if (
      !_.isUndefined(displayFromOptions) &&
      _.isNonNullObject(displayFromOptions) &&
      !_.isEmptyObject(displayFromOptions)
    ) {
      display = {
        config: displayFromOptions,
        source: 'options',
      };
    } else if (!_.isUndefined(displayFromPreferences)) {
      display = {
        config: displayFromPreferences,
        source: 'preferences',
      };
    }
  }

  return {
    config: {
      display: display.config,
      restrictions: restrictions.config,
    },

    sources: {
      display: display.source,
      restrictions: restrictions.source,
    },

    _raw: {
      options: configFromOptions,
      preferences: configFromPreferences,
    },
  };
}
