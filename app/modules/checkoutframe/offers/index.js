import GlobalOffers from './global';

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
    type: 'local',
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
      type: 'global',
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
    type: 'api',
  });

/**
 * Checks if offer is eligible.
 *
 * @param {Object} offer
 * @param {opts} opts
 *
 * @return {Boolean}
 */
const isOfferEligible = (offer, opts) => {
  const { session } = opts;

  const method = offer.payment_method;
  const enabledMethods = session.methods;

  if (method === 'wallet') {
    if (_.isArray(enabledMethods.wallet)) {
      if (
        _Arr.filter(
          enabledMethods.wallet,
          wallet => wallet.code === offer.issuer
        ).length
      ) {
        return true;
      }
    }
  } else if (method === 'cardless_emi' && offer.provider) {
    return (
      enabledMethods.cardless_emi && enabledMethods.cardless_emi[offer.provider]
    );
  } else {
    return enabledMethods[method];
  }

  return false;
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

  // Concat all offers and check for eligibility
  const allOffers =
    [].concat(apiOffers, globalOffers, localOffers)
    |> _Arr.filter(offer => isOfferEligible(offer, opts));

  return {
    offers: allOffers,
    forcedOffer: getForcedOffer(opts),
  };
};
