import { getOption, getOptionCurry, isContactEmailOptional } from './base';
import { getMerchantOffers, isOfferForced } from './offer';

/**
 * prefill related
 */
export const getPrefilledName = getOptionCurry('prefill.name');
export const getPrefilledCardNumber = getOptionCurry('prefill.card[number]');
export const getPrefilledVPA = getOptionCurry('prefill.vpa');

export const getPrefillMethod = () => {
  const prefilledMethod = getOption('prefill.method');
  const prefilledProvider = getOption('prefill.provider');
  // skipping method enabled check (it will handle automatically where we are consuming this)
  /**
   * Bajaj Finserv is _technically_ EMI,
   * but we're grouping it under Cardless EMI screen
   * on Checkout.
   */
  if (prefilledMethod === 'emi' && prefilledProvider === 'bajaj') {
    return 'cardless_emi';
  }
  /**
   * For prefilling card apps,
   * expected options are method: app & provider,
   * however, we're showing them on cards screen,
   * so set prefill as card.
   */
  if (
    prefilledMethod === 'app' &&
    ['google_pay', 'cred'].includes(prefilledProvider)
  ) {
    return 'card';
  }
  if (
    prefilledMethod === 'app' &&
    ['trustly', 'poli'].includes(prefilledProvider)
  ) {
    return 'international';
  }
  const forcedOffer = isOfferForced() && getMerchantOffers()?.[0];
  /**
   * For forced offers, we need to skip the home screen if the contact and
   * email is optional
   */
  if (forcedOffer && forcedOffer.payment_method && isContactEmailOptional()) {
    return forcedOffer.payment_method;
  }

  return prefilledMethod;
};

export const getPrefillBillingAddress = (nvs = false) => {
  const prefill: {
    line1: string;
    line2: string;
    state: string;
    city: string;
    country: string;
    postal_code: string;
    first_name?: string;
    last_name?: string;
  } = {
    line1: getOption('prefill.billing_address[line1]'),
    line2: getOption('prefill.billing_address[line2]'),
    state: getOption('prefill.billing_address[state]'),
    city: getOption('prefill.billing_address[city]'),
    country: getOption('prefill.billing_address[country]'),
    postal_code: getOption('prefill.billing_address[postal_code]'),
  };

  if (nvs) {
    prefill.first_name = getOption('prefill.billing_address[first_name]');
    prefill.last_name = getOption('prefill.billing_address[last_name]');
  }

  return prefill;
};

export const isPrefilledAndReadOnlyEmail = () => {
  return getOption('prefill.email') && getOption('readonly.email');
};

export const isPrefilledAndReadOnlyContact = () => {
  return getOption('prefill.contact') && getOption('readonly.contact');
};
