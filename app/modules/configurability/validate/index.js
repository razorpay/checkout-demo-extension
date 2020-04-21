import {
  getIin,
  findCodeByNetworkName,
  getNetworkFromCardNumber,
} from 'common/card';

const PAYMENT_VALIDATORS = {
  netbanking: (payment, instrument) => {
    if (!instrument.banks) {
      return true;
    }

    return _Arr.contains(instrument.banks, payment.bank);
  },

  wallet: (payment, instrument) => {
    if (!instrument.wallets) {
      return true;
    }

    return _Arr.contains(instrument.wallets, payment.wallet);
  },

  // Also used for paylater
  cardless_emi: (payment, instrument) => {
    if (!instrument.providers) {
      return true;
    }

    return _Arr.contains(instrument.providers, payment.provider);
  },

  upi: (payment, instrument) => {
    const { flows, apps } = instrument;

    if (!flows) {
      return true;
    }

    const isVpaPayment = payment.vpa || payment.token;
    const isQrPayment = payment['_[upiqr]'];
    const isIntentPayment = !isQrPayment && payment['_[flow]'] === 'intent';

    if (isVpaPayment) {
      return _Arr.contains(flows, 'collect');
    }

    if (isQrPayment) {
      return _Arr.contains(flows, 'qr');
    }

    if (isIntentPayment && _Arr.contains(flows, 'intent')) {
      if (!apps) {
        return true;
      }

      return _Arr.contains(apps, payment['_[app]']);
    }

    return false;
  },

  // Also used for emi
  card: (payment, instrument, { tokens = [] } = {}) => {
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
  },

  bank_transfer: () => true,
  paypal: () => true,
};

PAYMENT_VALIDATORS.paylater = PAYMENT_VALIDATORS.cardless_emi;
PAYMENT_VALIDATORS.emi = PAYMENT_VALIDATORS.card;

/**
 * Checks if the instrument is valid for the payment payload
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 * @param {Object} extra extra
 *
 * @returns {Promise<boolean>}
 */
export function isInstrumentValidForPayment(instrument, payment, extra) {
  const validator = PAYMENT_VALIDATORS[instrument.method];

  if (!validator) {
    return Promise.resolve(false); // Should reject but we'd need to polyfill Promise.allSettled for getValidPaymentInstruments
  }

  const validated = validator(payment, instrument, extra);

  return Promise.resolve(validated);
}

/**
 * Returns the valid payment instruments
 * @param {Object} payment Payment payload
 * @param {Array<Instrument>} instruments
 * @param {Object} extra
 *
 * @returns {Promise<Array<Instrument>>}
 */
export function getValidPaymentInstruments(payment, instruments, extra) {
  const methodInstruments = _Arr.filter(
    instruments,
    instrument => instrument.method === payment.method
  );

  const promises = _Arr.map(methodInstruments, instrument =>
    isInstrumentValidForPayment(instrument, payment, extra)
  );

  return Promise.all(promises).then(instrumentValidities => {
    let validInstruments = [];

    _Arr.loop(instrumentValidities, (valid, index) => {
      if (valid) {
        validInstruments.push(methodInstruments[index]);
      }

      return validInstruments;
    });
  });
}
