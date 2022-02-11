import {
  getIin,
  networks as CardNetworks,
  getNetworkFromCardNumber,
} from 'common/card';
import { getCardFeatures } from 'razorpay';

export function validateCardInstrument(
  payment,
  instrument,
  { tokens = [] } = {}
) {
  tokens = tokens.filter((token) => token.method === 'card');

  const cardNumberFromPayment = payment['card[number]'];
  let features = {};

  if (payment.token) {
    let token = _Arr.find(tokens, (token) => token.token === payment.token);

    if (token) {
      features = token.card;
    }
  } else if (cardNumberFromPayment) {
    features = getCardFeatures(cardNumberFromPayment);
  }

  return Promise.resolve(features).then((features) => {
    // Set things from features
    const type = features.type;
    const issuer = features.issuer;

    let network;
    let iin;

    // Network is sometimes fucked up
    if (features.network) {
      network = features.network;
    } else if (cardNumberFromPayment) {
      network = getNetworkFromCardNumber(cardNumberFromPayment);

      if (network) {
        // Translate mastercard to MasterCard
        network = CardNetworks[network];
      }
    }

    // IIN doesn't exist on saved cards
    if (cardNumberFromPayment) {
      iin = getIin(cardNumberFromPayment);
    }

    const { types, iins, issuers, networks } = instrument;

    let isTypeValid = true;
    let isNetworkValid = true;
    let isIssuerValid = true;
    let isIinValid = true;

    if (iin && iins) {
      isIinValid = _Arr.contains(iins, iin);
    }

    if (type && types) {
      isTypeValid = _Arr.contains(types, type);
    }

    if (issuer && issuers) {
      isIssuerValid = _Arr.contains(issuers, issuer);
    }

    if (network && networks) {
      isNetworkValid = _Arr.contains(networks, network);
    }

    return isTypeValid && isNetworkValid && isIssuerValid && isIinValid;
  });
}
