import { makeAuthUrl } from 'common/helper';
import BrowserStorage from 'browserstorage';
import { getSession } from 'sessionmanager';
import { isCREDEnabled } from 'checkoutstore/methods';
import { getAgentPayload } from 'common/useragentPayload';
import { getCustomerDetails } from 'checkoutstore/screens/home';
import { hasFeature, isContactOptional } from 'razorpay';
import { CredEvents, Events, Track } from 'analytics';
import { isEligibilityCheckInProgress } from './store';
import fetch from 'utils/fetch';
import {
  CRED_EXPERIMENTAL_OFFER_ID,
  CRED_EXPERIMENT_LOCAL_KEY,
  CRED_OFFER_EXPERIMENTS,
  CRED_MERCHANT_CONSENT,
} from './constants';
import { BUILD_NUMBER } from 'common/constants';

let CRED_ELIGIBILITY_CACHE = undefined;

/**
 * @typedef {Object} Offer
 * @property {String} id offer id
 * @property {String} name offer name
 * @property {String} display_text offer display text/ description
 * @property {String} payment_method method offer valid on
 * @property {String} type offer type
 * @property {String} issuer offer issuer
 */

/**
 * @typedef EligibilityCache
 * @property {Boolean} eligible
 * @property {String} offer offer description / display_text
 */

/**
 * This method is cache users details for CRED
 * @param {String} contact
 * @param {Boolean} value
 * @param {Offer} offer
 */
const setCREDEligibility = (contact, value, offer) => {
  if (CRED_ELIGIBILITY_CACHE) {
    CRED_ELIGIBILITY_CACHE[contact] = {
      eligible: value,
      offer,
    };
  }
};

/**
 *
 * @param {String} [contact] raw contact to parse
 * @returns if no contact is given then requests parses from proxy/home screen and return contact
 */
const getValidContact = (contact) => {
  let validContact = contact;
  if (!validContact) {
    validContact = isContactOptional()
      ? getSession().getProxyPhone()
      : getCustomerDetails()?.contact;
  }
  return validContact;
};

/**
 * @description this method initializes the basic data needed for CRED offers to work.
 * @param {Object} session current session
 */
const initCREDCache = (session) => {
  if (CRED_ELIGIBILITY_CACHE === undefined) {
    CRED_ELIGIBILITY_CACHE = {};
    // in optional contact flow this method will be called with empty object
    if (session && session.preferences) {
      setCREDEligibilityFromPreferences(session.preferences);
    }
  }
};

/**
 *
 * @param {String} display_text offer text to be displayed
 * @returns Offer prepared offer (read-only) of CRED app
 */
const prepareCREDoffer = (display_text) => {
  return {
    id: CRED_EXPERIMENTAL_OFFER_ID,
    name: 'CRED Offer',
    display_text,
    payment_method: 'card',
    type: 'read_only',
    issuer: 'cred',
  };
};

/**
 *
 * @param {Object} preferences session preferences
 * @returns {Array<Offer>} meta apps offers pulled preferences
 */
const getReadOnlyAppOffers = (preferences, avoidCredOfferPush) => {
  const metaApps = (preferences.methods || {}).app_meta || {};

  const metaAppOffers = [];

  Object.keys(metaApps).forEach(function (app) {
    if (metaApps[app].offer) {
      if (app === 'cred' && !avoidCredOfferPush) {
        metaAppOffers.push(prepareCREDoffer(metaApps[app].offer.description));
      }
    }
  });

  return metaAppOffers;
};

/**
 *
 * @param {Object} preferences session preferences
 * @param {Offer} offer offer to be pushed manually
 * @param {Boolean} removeOffer boolean defining whether to remove the CRED related offer from preferences completely
 */
const addReadOnlyOffers = (
  preferences,
  offer = undefined,
  removeOffer = false
) => {
  // DO NOT LOSE REFERENCE, which causes unexpected errors as session should run on same instance
  // update props/params only.
  const metaAppOffers = getReadOnlyAppOffers(
    preferences,
    Boolean(offer?.id === CRED_EXPERIMENTAL_OFFER_ID)
  );

  if (!preferences.offers) {
    preferences.offers = [];
  }

  metaAppOffers.forEach(function (offer) {
    preferences.offers.push(offer);
  });

  const filterOffers = () => {
    preferences.offers = preferences.offers.filter(
      ({ id }) => id !== CRED_EXPERIMENTAL_OFFER_ID
    );
  };

  if (offer) {
    filterOffers();

    // By this if experiment_type is already set and is not offer_tile exp
    // then CRED should not be shown in Offers view but should be shown in subtext exp
    const experiment = BrowserStorage.getItem(CRED_EXPERIMENT_LOCAL_KEY);
    if (!experiment || experiment !== CRED_OFFER_EXPERIMENTS.SUBTEXT) {
      preferences.offers.push(offer);
    }
    if (preferences.methods.app_meta?.cred?.offer) {
      preferences.methods.app_meta.cred.offer.description = offer.display_text;
    } else {
      preferences.methods.app_meta.cred.offer = {
        description: offer.display_text,
      };
    }
  }
  if (removeOffer) {
    filterOffers();
    if (preferences.methods.app_meta?.cred?.offer?.description) {
      delete preferences.methods.app_meta?.cred?.offer?.description;
    }
  }
};

/**
 *
 * @param {Object} preferences session preferences.
 * @description This method
 */
const setCREDEligibilityFromPreferences = (preferences) => {
  const contact = preferences.customer?.contact;
  const isEligible = preferences.methods?.app_meta?.cred?.user_eligible;
  const offerDescription =
    preferences.methods?.app_meta?.cred?.offer?.description;
  if (isEligible !== undefined && contact) {
    Events.Track(CredEvents.ELIGIBILITY_CHECK, {
      source: 'preferences',
      isEligible,
    });

    setCREDEligibility(contact, isEligible, offerDescription);
  }
};

/**
 * @param {String} contact contact to which checkout has to update CRED details / offers / etc.
 */
const updatePreferencesAndSession = (contact) => {
  const session = getSession();
  const { eligible, offer } = isUserEligible(contact) || {};

  if (eligible) {
    addReadOnlyOffers(session.preferences, prepareCREDoffer(offer));
    session.hideErrorMessage();
  } else {
    addReadOnlyOffers(session.preferences, undefined, true);
  }

  setupExperimentForCRED(session.preferences);

  // THIS IS TO UPDATE THE OFFERS SCREEN.
  session.setOffers();
};

/**
 * @description Unlike the standard experiments on checkout, for CRED,
 * the entire logic for the A/B resides in BE. BE either sends us the meta offer or the cred subtext
 * @param {Object} preferences the preferences response
 */
const setupExperimentForCRED = () => {
  // // The following comments/explanations is intentional, do not remove.

  // // The following method triggers a new flow (including validation hence avoid)
  // // setSessionPreferences(session, preferences);

  const experiment = getExperimentForCRED();
  if (experiment) {
    BrowserStorage.setItem(CRED_EXPERIMENT_LOCAL_KEY, experiment);
    Events.Track(CredEvents.SUBTEXT_OFFER_EXPERIMENT, {
      experiment,
    });
  }
};

/**
 *
 * @param {String} contact contact to check the CRED eligibility
 * This works irrespective of consent given or not.
 * Hence call this method after necessary checks
 * @returns {Promise<Object>}
 */
export const checkCREDEligibility = function (contact) {
  const session = getSession();
  const agentPayload = getAgentPayload({ cred: true }) || {};
  const url = makeAuthUrl(
    (session && session.r) || this,
    'payments/validate/account'
  );

  const promise = new Promise((resolve, reject) => {
    if (!contact) {
      return reject(new Error('contact is required to check eligibility'));
    }
    fetch.post({
      url,
      data: {
        entity: 'cred',
        value: contact,
        '_[checkout_id]': session?.id || this?.id,
        '_[build]': BUILD_NUMBER,
        '_[library]': Track.props.library,
        '_[platform]': Track.props.platform,
        ...agentPayload,
      },
      callback: (response) => {
        const isEligible = response.data?.state === 'ELIGIBLE';
        Events.Track(CredEvents.ELIGIBILITY_CHECK, {
          source: 'validate_api',
          isEligible,
        });
        if (isEligible) {
          const offerDescription = response?.data?.offer?.description;
          setCREDEligibility(contact, true, offerDescription);
          return resolve(response);
        }
        setCREDEligibility(contact, false);
        return reject(response);
      },
    });
  });

  return promise;
};

/**
 *
 * @param {String} contact contact to check in cache
 * @returns {EligibilityCache}
 */
export const isUserEligible = (contact) => {
  if (CRED_ELIGIBILITY_CACHE === undefined) {
    initCREDCache({});
  }
  return CRED_ELIGIBILITY_CACHE[contact];
};

/**
 *
 * This method returns the boolean defining merchant consent for cred is given or not.
 * @returns {boolean}
 */
export const isMerchantConsentForCREDGiven = () => {
  return hasFeature(CRED_MERCHANT_CONSENT, false);
};

/**
 *
 * This method returns the boolean defining merchant consent for cred is given or not.
 * @returns {CRED_OFFER_EXPERIMENTS}
 */
export const getExperimentForCRED = () => {
  // This method will fallback to subtext experiment when nothing is defined in preferences.
  return (
    BrowserStorage.getItem(CRED_EXPERIMENT_LOCAL_KEY) ||
    getSession().preferences?.methods?.app_meta?.cred?.experiment ||
    CRED_OFFER_EXPERIMENTS.SUBTEXT
  );
};

/**
 * This method is the starting point to set total CRED offer flow for a [new] contact.
 * This method is executed on each contact change, hence eligibility check will be made only if the merchant consent give.
 * @param {String} [currentContact]
 */
export const checkCREDEligibilityForUpdatedContact = (currentContact) => {
  if (!isCREDEnabled()) {
    return;
  }
  isEligibilityCheckInProgress.set(true);
  const session = getSession();
  const contact = getValidContact(currentContact, session);

  initCREDCache(session);

  const { eligible: _isUserEligible = undefined } =
    isUserEligible(contact) || {};

  if (_isUserEligible === undefined && isMerchantConsentForCREDGiven()) {
    checkCREDEligibility(contact)
      .then(function () {
        // const offerDescription = res?.data?.offer?.description;
        // setCREDEligibility(contact, true, offerDescription);
      })
      .catch(function () {
        // setCREDEligibility(contact, false);
      })
      .finally(function () {
        updatePreferencesAndSession(contact);
        isEligibilityCheckInProgress.set(false);
      });
  } else {
    updatePreferencesAndSession(contact);
    isEligibilityCheckInProgress.set(false);
  }
  // current contact is available cache hence no warning etc are needed
  return null;
};
