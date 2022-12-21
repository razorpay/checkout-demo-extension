import {
  getIin,
  networks as CardNetworks,
  getNetworkFromCardNumber,
  isCountryInAllowedList,
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
    let token = tokens.find((token) => token.token === payment.token);

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
    const country = features.country;
    const cobranding_partner = features.cobranding_partner;

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

    const { types, iins, issuers, networks, countries, cobranded_partners } =
      instrument;

    let isTypeValid = true;
    let isNetworkValid = true;
    let isIssuerValid = true;
    let isIinValid = true;
    let isCountryValid = true;
    let isCoBrandingValid = true;

    if (iin && iins) {
      isIinValid = iins.includes(iin);
    }

    if (type && types) {
      isTypeValid = types.includes(type);
    }

    if (issuer && issuers) {
      isIssuerValid = issuers.includes(issuer);
    }

    if (network && networks) {
      isNetworkValid = networks.includes(network);
    }
    if (country && countries) {
      isCountryValid = isCountryInAllowedList(country, countries);
    }

    if (cobranded_partners) {
      // If co branding config is there
      // but the entered card does not have a cobranding partner assiciated
      // invalidated the card
      if (!cobranding_partner) {
        isCoBrandingValid = false;
      } else {
        isCoBrandingValid = cobranded_partners.includes(cobranding_partner);
      }
    }

    return (
      isTypeValid &&
      isNetworkValid &&
      isIssuerValid &&
      isIinValid &&
      isCountryValid &&
      isCoBrandingValid
    );
  });
}
