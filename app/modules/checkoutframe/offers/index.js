import GlobalOffers from './global';
import { isPartialPayment } from 'checkoutstore';
import {
  isMethodEnabled,
  getWallets,
  getCardlessEMIProviders,
} from 'checkoutstore/methods';

/**
 * Default data that should be present in all offers.
 */
const defaultDataForOffer = {
  homescreen: true,
  removable: true,
};

/**
 * Fill data in an offer.
 * @param {Object} offer Offer
 * @param {Object} data Extra data to be filled, apart from the default data
 *
 * @return {Object}
 */
const fillMissingDataInOffer = (offer, data = {}) =>
  ({}
  |> _Obj.extend(defaultDataForOffer)
  |> _Obj.extend(data)
  |> _Obj.extend(offer));

/**
 * Fill data in all offers in a list.
 * @param {Array} offers List of offers
 * @param {Object} data Extra data to be filled, apart from the default data
 *
 * @return {Array}
 */
const fillMissingDataInOffers = (offers, data) =>
  offers.map(offer => fillMissingDataInOffer(offer, data));

/**
 * Get local offers.
 * @param {Object} opts Options
 *
 * @return {Array} offers Local offers
 */
const getLocalOffers = opts => {
  return fillMissingDataInOffers([], {
    _type: 'local',
  });
};

/**
 * Get the eligible global offers.
 * @param {Object} opts Options
 *
 * @return {Array} offers Eligible global offers
 */
const getGlobalOffers = opts =>
  fillMissingDataInOffers(
    GlobalOffers
      |> _Arr.filter(globalOffer => globalOffer.isEligible(opts))
      |> _Arr.map(eligibleOffer => eligibleOffer.offer),
    {
      _type: 'global',
    }
  );

/**
 * Get offers from API.
 * @param {Object} opts Options
 *
 * @return {Array} offers Offers from API
 */
const getApiOffers = ({ preferences }) =>
  fillMissingDataInOffers(preferences.offers || [], {
    _type: 'api',
  });

/**
 * Checks if offer is eligible.
 *
 * @param {Object} offer
 * @param {opts} opts
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
 * @param {Object} opts Options
 *
 * @return {Object} offer Forced offer
 */
export const getForcedOffer = opts => {
  const { preferences } = opts;

  return preferences.force_offer && getApiOffers(opts)[0];
};

/**
 * Creates a list of offers to be used.
 * @param {Object} opts Options
 *
 * @return {Object} offers List of offers
 */
export const createOffers = opts => {
  const apiOffers = getApiOffers(opts);
  const globalOffers = getGlobalOffers(opts);
  const localOffers = getLocalOffers(opts);

  let allOffers = [];

  // Concat all offers and check for eligibility, but only if this isn't a partial payment
  if (!isPartialPayment()) {
    allOffers =
      [].concat(apiOffers, globalOffers, localOffers)
      |> _Arr.filter(offer => isOfferEligible(offer));
  }

  return {
    offers: allOffers,
    forcedOffer: getForcedOffer(opts),
  };
};
