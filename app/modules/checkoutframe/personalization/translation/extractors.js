/**
 * Extracts config data related to UPI from the preferred instrument.
 *
 * @param {Object} instrument
 * @return {Object}
 */
function upi(instrument) {
  const base = {
    method: 'upi',
  };
  if (instrument['_[upiqr]']) {
    // QR
    base.flows = ['qr'];
  } else if (instrument['_[flow]'] === 'intent') {
    // Intent
    base.flows = ['intent'];

    if (instrument.upi_app) {
      base.apps = [instrument.upi_app];
    }
  } else if (instrument['_[flow]'] === 'directpay') {
    base.flows = ['collect'];

    if (instrument.vpa) {
      base.vpas = [instrument.vpa];
    }
  }

  return base;
}

/**
 * Extracts config data related to netbanking from the preferred instrument.
 *
 * @param {Object} instrument
 * @return {Object}
 */
function netbanking(instrument) {
  return {
    method: 'netbanking',
    banks: [instrument.bank],
  };
}

/**
 * Extracts config data related to saved card from the preferred instrument.
 *
 * @param {Object} instrument
 * @return {Object}
 */
function card(instrument) {
  return {
    method: 'card',
    types: [instrument.type],
    issuers: [instrument.issuer],
    networks: [instrument.network],
  };
}

/**
 * Extracts config data related to saved card from the preferred instrument.
 *
 * @param {Object} instrument
 * @return {Object}
 */
function emi(instrument) {
  return {
    method: 'emi',
    types: [instrument.type],
    issuers: [instrument.issuer],
    networks: [instrument.network],
  };
}

/**
 * Extracts config data related to wallet from the preferred instrument.
 *
 * @param {Object} instrument
 * @return {Object}
 */
function wallet(instrument) {
  return {
    method: 'wallet',
    wallets: [instrument.wallet],
  };
}

function paypal(instrument) {
  return {
    method: 'paypal',
  };
}

function app(instrument) {
  return {
    method: 'app',
    providers: [instrument.provider],
  };
}

export default {
  upi,
  netbanking,
  card,
  wallet,
  paypal,
  emi,
  app,
};
