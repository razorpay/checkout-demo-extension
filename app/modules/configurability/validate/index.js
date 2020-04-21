import { validateCardInstrument } from './card';

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
  card: validateCardInstrument,

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
