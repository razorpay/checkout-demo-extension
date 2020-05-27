import GlobalOffers from './global';
import {
  isPartialPayment,
  getMerchantOffers,
  isOfferForced,
} from 'checkoutstore';
import {
  isMethodEnabled,
  getWallets,
  getCardlessEMIProviders,
} from 'checkoutstore/methods';

/**
 * Checks if offer is eligible.
 *
 * @param {Object} offer
 *
 * @return {Boolean}
 */
const isOfferEligible = offer => {
  const method = offer.payment_method;
  let isEnabled;

  if (method === 'wallet') {
    return (
      getWallets() |> _Arr.filter(w => w.code === offer.issuer) |> _.lengthOf
    );
  }

  if (method === 'cardless_emi') {
    if (offer.provider) {
      return (
        isMethodEnabled('cardless_emi') &&
        getCardlessEMIProviders()[offer.provider]
      );
    }
  }

  return isMethodEnabled(offer.payment_method);
};

/**
 * Get the forced offer.
 *
 * @return {Object} offer Forced offer
 */
export const getForcedOffer = () => {
  return isOfferForced() && getMerchantOffers()[0];
};

export const getCardOffer = () => {
  const offer = getForcedOffer();
  if (offer?.payment_method === 'card') {
    return offer;
  }
  return null;
};

export const hasOffersOnHomescreen = () => {
  return Boolean(getCardOffer() || getOffersForTab().length);
};

export function getOfferMethodForTab(tab) {
  if (tab === 'emiplans') {
    tab = 'emi';
  }
  return tab;
}

/**
 * Returns a list of offers to be used on a given tab
 * @param {String} tab Current Tab
 *
 * @return {Array} offers List of offers
 */
export function getOffersForTab(method) {
  const allOffers = getAllOffers();

  if (method) {
    // EMI plans should have the same offers as EMI
    // TODO: Fix for Cardless EMI
    method = getOfferMethodForTab(method);
    if (method === 'cardless_emi') {
      allOffers.push(zestMoneyOffer);
    }
    return allOffers.filter(function(o) {
      return o.payment_method === method;
    });
  }
  return allOffers;
}

const instrumentKey = {
  cardless_emi: 'providers',
  wallet: 'wallets',
  card: 'issuers',
  netbanking: 'banks',
};

/**
 * Returns a list of offers to be used on a given instrument
 * @param {Instrument} instrument Selected instrument
 *
 * @return {Array<Offer>} offers List of offers
 */
export function getOffersForInstrument(instrument) {
  const offers = getOffersForTab(instrument.method);
  const key = instrumentKey[instrument.method];
  if (key) {
    return offers.filter(offer => {
      const offerIssuer = offer.issuer;
      const instrumentValues = instrument[key];

      // Offer is method-wide
      if (!offerIssuer) {
        return true;
      }

      // Instrument is not scoped down to any specific issuers/banks/wallets/providers
      if (!instrumentValues) {
        return true;
      }

      return _Arr.contains(instrumentValues, offerIssuer);
    });
  }
  return offers;
}

/**
 * Returns a list of offers not applicable on selected method or instrument
 * @param  {Array} filteredOffers list of all offers available for
 *                                current checkout session
 * @return {Array} List of offers
 */
export function getOtherOffers(filteredOffers) {
  const allOffers = getAllOffers();
  const otherOffers = [];
  let filteredIndex = 0;
  for (let i = 0; i < allOffers.length; i++) {
    if (filteredOffers[filteredIndex] === allOffers[i]) {
      filteredIndex++;
    } else {
      otherOffers.push(allOffers[i]);
    }
  }
  return otherOffers;
}

/**
 * Creates a list of all offers.
 *
 * @return {Object} offers List of offers
 */
export const getAllOffers = () => {
  if (isPartialPayment()) {
    return [];
  } else {
    return getMerchantOffers() || [] |> _Arr.filter(isOfferEligible);
  }
};

const zestMoneyOffer = {
  name: 'ZestMoney: 0% Interest available',
  payment_method: 'cardless_emi',
  provider: 'zestmoney',
  display_text:
    'Applicable only on EMI tenure of 3 months.\nInterest will be returned as cashback on repayment of each EMI.',
};
