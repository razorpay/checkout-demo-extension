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

import { instruments } from 'checkoutstore/screens/home';
import { get as storeGetter } from 'svelte/store';
import {
  isSavedCardInstrument,
  isInstrumentGrouped,
} from 'ui/tabs/home/instruments';

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

/**
 * Returns the offers for selected method + instrument combo
 * @param {string} method
 * @param {Instrument|undefined} instrument
 *
 * @returns {Array<Offer>}
 */
export function getOffersForMethodWithInstrument(method, instrument) {
  const methodOffers = getOffersForTab(method);

  if (instrument) {
    return _Arr.filter(methodOffers, offer =>
      isOfferEligibleOnInstrument(offer, instrument)
    );
  } else {
    return methodOffers;
  }
}

const instrumentKey = {
  cardless_emi: 'providers',
  wallet: 'wallets',
  card: 'issuers',
  netbanking: 'banks',
};

/**
 * Tells if the offer is eligible for the instrument
 * @param {Offer} offer
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
function isOfferEligibleOnInstrument(offer, instrument) {
  if (offer.payment_method !== instrument.method) {
    return false;
  }

  const key = instrumentKey[instrument.method];

  if (key) {
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
  } else {
    return true;
  }
}

/**
 * Returns a list of offers to be used on a given instrument
 * @param {Instrument} instrument Selected instrument
 *
 * @return {Array<Offer>} offers List of offers
 */
export function getOffersForInstrument(instrument) {
  const offers = getOffersForTab(instrument.method);

  return _Arr.filter(offers, offer =>
    isOfferEligibleOnInstrument(offer, instrument)
  );
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

function _getAllInstrumentsForOffer(offer) {
  const allInstruments = storeGetter(instruments);

  return _Arr.filter(allInstruments, instrument =>
    isOfferEligibleOnInstrument(offer, instrument)
  );
}

function _getInstrumentTypeToSwitch(instrument) {
  if (instrument._type === 'method') {
    return 'rzp.method';
  }

  if (isInstrumentGrouped(instrument)) {
    return 'instrument.grouped';
  }

  return 'instrument.single';
}

/**
 * Returns the first matching instrument for the offer
 *
 * TODO
 * Improvise this by adding heuristics:
 * - method instrument should be prioritised
 *
 * @param {Offer} offer
 *
 * @returns {Instrument|undefined}
 */
export function getInstrumentForOffer(offer) {
  const instruments = _getAllInstrumentsForOffer(offer);
  const nonSavedCardInstruments = _Arr.filter(
    instruments,
    instrument => !isSavedCardInstrument(instrument)
  );

  const first = nonSavedCardInstruments[0];

  if (first) {
    return {
      type: _getInstrumentTypeToSwitch(first),
      instrument: first,
    };
  }
}
