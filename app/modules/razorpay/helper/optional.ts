import {
  getMerchantOption,
  getOption,
  getOrgDetails,
  getPreferences,
} from './base';
import { isIndianCurrency } from './currency';
import { isOneClickCheckout } from './1cc';

/**
 * optional
 */
export function isContactOptional() {
  return (getPreferences('optional') || []).indexOf('contact') !== -1;
}

/**
 * for email less checkout
 * show_email_on_checkout | email_optional_oncheckout | result
 * false | false | true
 * true | false | false
 * true | true | true
 * false | true | true
 * if email_optional_oncheckout flag & show_email_on_checkout both true then we show optional email field on checkout
 * 1cc & international
 */
export function isEmailOptional() {
  const { isOrgRazorpay } = getOrgDetails() || {};
  return (
    // TODO remove this once we release optional email 100%
    (getPreferences('optional') || []).indexOf('email') !== -1 ||
    (!(
      getPreferences('features.show_email_on_checkout') &&
      !getPreferences('features.email_optional_oncheckout')
    ) &&
      isIndianCurrency() &&
      !isOneClickCheckout() &&
      isOrgRazorpay)
  );
}
export function isContactEmailOptional() {
  return isContactOptional() && isEmailOptional();
}

export function getOptionalObject() {
  return {
    contact: isContactOptional(),
    email: isEmailOptional(),
  };
}

// Hidden fields
export function isContactHidden() {
  return isContactOptional() && getOption('hidden.contact');
}

export function isEmailHidden() {
  const isEmailHiddenFromPreference = !getPreferences(
    'features.show_email_on_checkout'
  );
  const isEmailHiddenFromOption = getMerchantOption('hidden.email');
  const isEmailHidden =
    typeof isEmailHiddenFromOption === 'boolean'
      ? isEmailHiddenFromOption
      : isEmailHiddenFromPreference;
  return isEmailOptional() && isEmailHidden;
}

export function isContactEmailHidden() {
  return isContactHidden() && isEmailHidden();
}
