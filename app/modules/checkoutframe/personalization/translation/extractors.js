import { toLowerCaseSafe } from 'lib/utils';

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
    base.flow = 'qr';
  } else if (instrument['_[flow]'] === 'intent') {
    // Intent
    base.flow = 'intent';

    if (instrument.app_name) {
      base.app = instrument.app_name;
    }
  } else if (instrument['_[flow]'] === 'directpay') {
    base.flow = 'collect';

    if (instrument.vpa) {
      base.vpa = instrument.vpa;
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
    bank: instrument.bank,
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
    card_type: instrument.type,
    issuer: instrument.issuer,
    network: toLowerCaseSafe(instrument.network),
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
    wallet: instrument.wallet,
  };
}

function paypal(instrument) {
  return {
    method: 'paypal',
  };
}

export default {
  upi,
  netbanking,
  card,
  wallet,
  paypal,
};
