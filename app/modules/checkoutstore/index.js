import { getDowntimes as _getDowntimes } from 'checkoutframe/downtimes';
import { TAB_TITLES } from 'common/constants';

let razorpayInstance, preferences;

export function setRazorpayInstance(_razorpayInstance) {
  razorpayInstance = _razorpayInstance;
  preferences = razorpayInstance.preferences;
  if (isIRCTC()) {
    TAB_TITLES.upi = 'BHIM/UPI';
    TAB_TITLES.card = 'Debit/Credit Card';
    razorpayInstance.set('theme.image_frame', false);
  }
}

const IRCTC_KEYS = [
  'rzp_test_mZcDnA8WJMFQQD',
  'rzp_live_ENneAQv5t7kTEQ',
  'rzp_test_kD8QgcxVGzYSOU',
  'rzp_live_alEMh9FVT4XpwM',
];

export const isIRCTC = () => IRCTC_KEYS |> _Arr.contains(getOption('key'));

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
export const getCardFlows = (iin, cb) => razorpayInstance.getCardFlows(iin, cb);
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
  entityWithAmount.find(entity => preferences |> _Obj.hasProp(entity));

// @TODO return amount based on partial payment
// @TODO use everywhere instead of session.get('amount')
// @TODO start using entityWithAmount
export const getAmount = () => {
  return getOption('amount');
};

// @TODO export and use everywhere
export const getCurrency = () => {
  return getEntityWithAmount()?.currency || getOption('currency');
};

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

export function shouldSeparateDebitCard() {
  return getOption('theme.debit_card');
}

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function getBanks() {
  return preferences.methods.netbanking;
}
