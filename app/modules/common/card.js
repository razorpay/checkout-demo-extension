import { isDynamicFeeBearer } from 'razorpay/index';
import RazorpayConfig from 'common/RazorpayConfig';
import { makeAuthUrl } from 'common/helper';
import Analytics, { Track } from 'analytics';
import { checkDowntime } from 'checkoutframe/downtimes';

import { setDynamicFeeObject, isAddCardView } from 'checkoutstore/dynamicfee';

export const API_NETWORK_CODES_MAP = {
  AMEX: 'amex',
  DICL: 'diners',
  JCB: 'jcb',
  MAES: 'maestro',
  MC: 'mastercard',
  RUPAY: 'rupay',
  VISA: 'visa',
};

export const networks = {
  amex: 'American Express',
  diners: 'Diners Club',
  maestro: 'Maestro',
  mastercard: 'MasterCard',
  rupay: 'RuPay',
  visa: 'Visa',
  bajaj: 'Bajaj Finserv',
  unknown: 'unknown',
};

const cdnUrl = RazorpayConfig.cdn;
const fullPrefix = cdnUrl + 'acs/network/';

export const getFullNetworkLogo = (code) => `${fullPrefix}${code}.svg`;

/**
 * Strips everything but digits.
 * @param {String} cardNumber
 *
 * @return {String}
 */
export const getCardDigits = (cardNumber) => cardNumber.replace(/\D/g, '');

/**
 * Returns the IIN of the card.
 * @param {String} cardNumber
 *
 * @return {String}
 */
export const getIin = (cardNumber) => getCardDigits(cardNumber).slice(0, 6);

/**
 * Returns either IIN or Token from a payload.
 *
 * @param payload
 * @returns {string|*}
 */
export const getCardEntityFromPayload = (payload) => {
  if (payload.tokenId) {
    return payload.tokenId;
  }
  if (payload.cardNumber) {
    return String(payload.cardNumber).slice(0, 6);
  }
  if (payload['card[number]']) {
    return String(payload['card[number]']).slice(0, 6);
  }
  if (payload.iin) {
    return String(payload.iin).slice(0, 6);
  }
};

/**
 * @param {String} name {eg: MasterCard}
 *
 * @return {String} {eg: mastercard}
 */
export const findCodeByNetworkName = (name) => {
  let code;

  _Obj.loop(networks, (val, key) => {
    if (name === val || name === key) {
      code = key;
    }
  });

  return code;
};

/**
 * @param {String} code {eg: mastercard}
 *
 * @return {String} {eg: MasterCard}
 */
export const findNetworkNameByCode = (code) => {
  return networks[code];
};

const cardPatterns = [
  {
    name: 'visa',
    regex: /^4/,
  },
  {
    name: 'mastercard',
    regex: /^(5[1-5]|2[2-7])/,
  },
  {
    name: 'maestro16',
    regex: /^(50(81(25|26|59|92)|8227)|4(437|681))/,
  },
  {
    name: 'amex',
    regex: /^3[47]/,
  },
  // keep more specific rupay above catchall maestro
  {
    name: 'rupay',
    regex: /^787878/, // BEPG sample card number
  },
  {
    name: 'rupay',
    regex:
      /^(508[5-9]|60(80(0|)[^0]|8[1-4]|8500|698[5-9]|699|7[^9]|79[0-7]|798[0-4])|65(2(1[5-9]|[2-9])|30|31[0-4])|817[2-9]|81[89]|820[01])/,
  },
  {
    name: 'discover',
    regex: /^(65[1,3-9]|6011)/,
  },
  {
    name: 'maestro',
    regex: /^(6|5(0|[6-9])).{5}/,
  },
  {
    name: 'diners',
    regex: /^3[0689]/,
  },
  {
    name: 'jcb',
    regex: /^35/,
  },
  {
    name: 'bajaj',
    regex: /^203040/,
  },
];

const cardLengths = {
  amex: 15,
  diners: 14,
  maestro: 19,
  '': 19,
};

export const getCardType = (cardNumber) => {
  cardNumber = cardNumber.replace(/\D/g, '');
  let cardType = '';
  cardPatterns.forEach((card) => {
    if (card.regex.test(cardNumber)) {
      if (!cardType) {
        cardType = card.name;
      }
    }
  });
  return cardType;
};

/**
 * Tries to figure out the network from the card number
 * @param {string} cardNumber
 *
 * @returns {string}
 */
export const getNetworkFromCardNumber = (cardNumber) => {
  let network = getCardType(cardNumber);

  if (network === 'maestro16') {
    network = 'maestro';
  }

  return network;
};

/**
 * Tells us if the card network is AMEX
 * @param {string} cardNumber
 *
 * @returns {string}
 */
export const isAmex = (cardNumber) => {
  let network = getCardType(cardNumber);
  return network === 'amex';
};

export const getCardMaxLen = (cardType) => cardLengths[cardType] || 16;

export const getCardSpacing = (maxLen) => {
  if (maxLen !== 19) {
    if (maxLen < 16) {
      return /(^.{4}|.{6})/g;
    } else {
      return /(.{4})/g;
    }
  }
};

/**
 * Checks if the card network in payment is one among the list provided.
 * @param {Object} paymentData
 * @param {Array} listOfNetworks
 * @param {*} tokens
 */
export function isCardNetworkInPaymentOneOf(
  paymentData,
  listOfNetworks,
  tokens = []
) {
  const cardNumber = paymentData['card[number]'];
  const token = paymentData['token'];
  let network = '';

  if (token) {
    const cardToken = tokens.find((t) => t.token === token);

    if (cardToken && cardToken.card && cardToken.card.network) {
      network = cardToken.card.network;
    }
  } else if (cardNumber) {
    network = getCardType(cardNumber);
  } else {
    // Not a card payment
    return false;
  }

  network = network.toLowerCase();

  return Boolean(
    listOfNetworks.find((listNetwork) => listNetwork.toLowerCase() === network)
  );
}

/**
 * Tells whether or not the IIN is valid
 * @param {string} cardNumber
 *
 * @returns {boolean}
 */
export const isIinValid = (cardNumber) => {
  const iin = getIin(cardNumber);

  return iin && iin.length >= 6;
};

// Store card metadata (issuer, network, type, last4)
const CardMetadata = {
  iin: {},
  token: {},
};
/**
 * Cache IIN metadata
 * For network, checkout network code is saved.
 * @param iin
 * @param data
 */
export function updateCardIINMetadata(iin, data = {}) {
  iin = getIin(iin);
  if (!CardMetadata.iin[iin]) {
    CardMetadata.iin[iin] = {};
  }
  const cache = CardMetadata.iin[iin];
  if (data.issuer) {
    cache.issuer = data.issuer;
  }
  if (data.network) {
    // Not "MasterCard", not "MC", just "mastercard".
    cache.network = findCodeByNetworkName(data.network);
  } else {
    cache.network = getCardType(iin);
  }
  if (data.type) {
    cache.type = data.type;
  }
}

/**
 * Cache token metadata
 * @param token
 * @param data
 */
export function updateCardTokenMetadata(token, data = {}) {
  if (!CardMetadata.token[token]) {
    CardMetadata.token[token] = {};
  }
  const cache = CardMetadata.token[token];
  if (data.issuer) {
    cache.issuer = data.issuer;
  }
  if (data.network) {
    cache.network = findCodeByNetworkName(data.network);
  }
  if (data.type) {
    cache.type = data.type;
  }
  if (data.last4) {
    cache.last4 = data.last4;
  }
}

/**
 * Returns card metadata if it was cached earlier
 * @param entity IIN/Token ID/Card Number
 * @returns {{}}
 */
export function getCardMetadata(entity) {
  const isToken = /^token_/.test(entity);
  if (isToken) {
    return _Obj.clone(CardMetadata.token[entity] || {});
  }
  const isIIN = /^\d{6}$/.test(entity);
  if (isIIN) {
    return _Obj.clone(CardMetadata.iin[entity] || {});
  }
  const iin = getIin(entity);
  // If entity is a card number then we can send last 4 digits in metadata.
  const data = { last4: getCardDigits(entity).slice(-4) };
  // Merge { last4 } with other cached details and return.
  return _Obj.extend(data, CardMetadata.iin[iin] || {});
}

const CardFeatureCache = {
  iin: {},
};

const CardFeatureRequests = {
  iin: {},
};

/**
 * Fetches card features from cache.
 * TODO: Remove cache for this when logic to determine Native OTP
 *       flow can be supported using a Promise
 * @param {String} cardNumber
 *
 * @return {Object/undefined}
 */
export function getCardFeaturesFromCache(cardNumber) {
  if (!isIinValid(cardNumber)) {
    return {};
  }

  const iin = getIin(cardNumber);

  const features = CardFeatureCache.iin[iin];

  if (features) {
    Analytics.track('features:card:fetch:success', {
      data: {
        iin,
        cache: true,
      },
    });
  }

  return features;
}

/**
 * Gets the features associated with a card.
 * @param {string} cardNumber
 *
 * @returns {Promise}
 */
export function getCardFeatures(cardNumber) {
  if (!isIinValid(cardNumber)) {
    return Promise.resolve({});
  }

  const iin = getIin(cardNumber);

  const existingRequest = CardFeatureRequests.iin[iin];

  if (existingRequest) {
    if (isDynamicFeeBearer() && isAddCardView()) {
      if (CardFeatureCache.iin[iin]) {
        setDynamicFeeObject('card', CardFeatureCache.iin[iin]?.type);
      }
    }
    return existingRequest;
  }

  CardFeatureRequests.iin[iin] = new Promise((resolve, reject) => {
    let url = makeAuthUrl(this, 'payment/iin');

    // append IIN and source as query
    url = _.appendParamsToUrl(url, {
      iin,
      '_[source]': Track.props.library,
    });

    fetch.jsonp({
      url,
      callback: (features) => {
        if (features.error) {
          Analytics.track('features:card:fetch:failure', {
            data: {
              iin,
              error: features.error,
            },
          });
          return reject(features.error);
        }

        // Store in cache
        CardFeatureCache.iin[iin] = features;

        // Update card metadata
        updateCardIINMetadata(iin, features);

        // Dynamic Fee Card Type
        if (isDynamicFeeBearer() && isAddCardView()) {
          let cardType;
          if (CardFeatureCache.iin[iin]) {
            cardType = CardFeatureCache.iin[iin]?.type;
          } else {
            cardType = features?.type;
          }

          setDynamicFeeObject('card', cardType);
        }

        // Resolve
        resolve(features);

        Analytics.track('features:card:fetch:success', {
          data: {
            iin,
            features,
          },
        });
      },
    });

    Analytics.track('features:card:fetch:start', {
      data: {
        iin,
      },
    });
  });

  return CardFeatureRequests.iin[iin];
}

/**
 * Gets the saved cards as an array and cards downtimes as an obj.
 * @param {array} cards
 * @param {object} cards
 *
 * @returns {array}
 */
export function addDowntimesToSavedCards(cards, downtimes) {
  const cardsWithDowntime = cards.map((item) => {
    const { network, issuer } = item.card;
    let networkDowntime = checkDowntime(downtimes, 'network', network);
    let issuerDowntime = checkDowntime(downtimes, 'issuer', issuer);
    if (!networkDowntime && !issuerDowntime) {
      item.card.downtimeSeverity = false;
      return item;
    }
    item.card.downtimeSeverity = networkDowntime || issuerDowntime;
    item.card.downtimeInstrument = networkDowntime ? network : issuer;
    return item;
  });
  return cardsWithDowntime;
}

export function injectSiftScript(sessionId, beaconKey = __SIFT_BEACON_KEY__) {
  if (document.getElementById('__sift_script') || !sessionId || !beaconKey) {
    return Promise.resolve();
  }

  let _sift = (window._sift = window._sift || []);
  _sift.push(['_setAccount', beaconKey]);
  _sift.push(['_setTrackerUrl', 'siftjs.razorpay.com']);
  _sift.push(['_setUserId', '']);
  _sift.push(['_setSessionId', sessionId]);
  _sift.push(['_trackPageview']);

  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = 'https://siftjs.razorpay.com/s.js';
    script.type = 'text/javascript';
    script.onError = reject;
    script.async = true;
    script.id = '__sift_script';
    script.onload = resolve;
    script.addEventListener('error', reject);
    script.addEventListener('load', resolve);
    document.body.appendChild(script);
  });
}
