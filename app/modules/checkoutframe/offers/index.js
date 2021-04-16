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

import {
  instruments,
  selectedInstrument,
  sequence as sequenceStore,
} from 'checkoutstore/screens/home';
import { get as storeGetter } from 'svelte/store';
import {
  isSavedCardInstrument,
  isInstrumentForEntireMethod,
} from 'configurability/instruments';

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
    const sequence = storeGetter(sequenceStore);
    const sessionHasEmi = _Arr.contains(sequence, 'emi');

    // EMI plans should have the same offers as EMI
    // TODO: Fix for Cardless EMI
    method = getOfferMethodForTab(method);
    let methods = [method];

    /**
     * "EMI on Cards" is also present in the Cardless EMI screen.
     * So, if the tab is cardless_emi, we should need to show offers of "emi" method too.
     */
    if (sessionHasEmi && method === 'cardless_emi') {
      methods.push('emi');
    }

    return allOffers.filter(offer =>
      _Arr.contains(methods, offer.payment_method)
    );
  }

  return allOffers;
}

export function getOffersForTabAndInstrument({ tab, instrument }) {
  if (instrument && instrument.method === tab) {
    return getOffersForInstrument(instrument);
  } else {
    return getOffersForTab(tab);
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
  let instrumentMethod = instrument.method;

  const sequence = storeGetter(sequenceStore);

  const sessionHasEmi = _Arr.contains(sequence, 'emi');
  const isOfferForEmi = offer.payment_method === 'emi';
  const isInstrumentForEmi = instrument.method === 'emi';
  const isInstrumentForCardlessEmi = instrument.method === 'cardless_emi';

  if (isInstrumentForCardlessEmi && sessionHasEmi && isOfferForEmi) {
    // Do nothing
  } else if (offer.payment_method !== instrumentMethod) {
    return false;
  }

  const key = instrumentKey[instrumentMethod];

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

const INSTRUMENT_TO_SELECT_HANDLERS = {
  default: offer => {
    const instruments = _getAllInstrumentsForOffer(offer);
    const nonSavedCardInstruments = _Arr.filter(
      instruments,
      instrument => !isSavedCardInstrument(instrument)
    );

    const first = nonSavedCardInstruments[0];

    if (first) {
      return first;
    }
  },

  card: offer => {
    const instruments = _getAllInstrumentsForOffer(offer);

    // Try choosing instrument for entire method
    const methodInstrument = _Arr.find(
      instruments,
      isInstrumentForEntireMethod
    );

    if (methodInstrument) {
      return methodInstrument;
    }

    return INSTRUMENT_TO_SELECT_HANDLERS.default(offer);
  },
};

INSTRUMENT_TO_SELECT_HANDLERS.emi = INSTRUMENT_TO_SELECT_HANDLERS.card;

/**
 * Returns a matching instrument for the offer
 *
 * Heuristics:
 * - If current instrument can support the offer, return it
 * - Otherwise, return the first instrument for which offers match (TODO: Improve this?)
 *
 * @param {Offer} offer
 *
 * @returns {Instrument|undefined}
 */
export function getInstrumentToSelectForOffer(offer) {
  const currentInstrument = storeGetter(selectedInstrument);

  if (currentInstrument) {
    const isCurrentInsturmentForSavedCard = isSavedCardInstrument(
      currentInstrument
    );
    const isOfferEligibleOnCurrentInstrument = isOfferEligibleOnInstrument(
      offer,
      currentInstrument
    );

    if (
      !isCurrentInsturmentForSavedCard &&
      isOfferEligibleOnCurrentInstrument
    ) {
      return currentInstrument;
    }
  }

  // Not eligible on currently selected instrument
  // Search for other eligible instruments

  const handler =
    INSTRUMENT_TO_SELECT_HANDLERS[offer.payment_method] ||
    INSTRUMENT_TO_SELECT_HANDLERS.default;

  return handler(offer);
}
