import {
  getIin,
  findCodeByNetworkName,
  getNetworkFromCardNumber,
} from 'common/card';

export function validateCardInstrument(
  payment,
  instrument,
  { tokens = [] } = {}
) {
  tokens = _Arr.filter(tokens, token => token.method === 'card');

  let featuresPromise = Promise.resolve({});

  if (payment.token) {
    let token = _Arr.find(tokens, token => token.token === payment.token);

    if (token) {
      featuresPromise = Promise.resolve(token.card);
    }
  }

  return featuresPromise.then(features => {
    const cardNumberFromPayment = payment['card[number]'];

    // Set things from features
    const type = features.type;
    const issuer = features.issuer;

    let network;
    let iin;

    // Network is sometimes fucked up
    if (features.network) {
      network = findCodeByNetworkName(features.network);
    } else if (cardNumberFromPayment) {
      network = getNetworkFromCardNumber(cardNumberFromPayment);
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
