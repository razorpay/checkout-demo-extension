import { validateCardInstrument } from './card';

const PAYMENT_VALIDATORS = {
  netbanking: (payment, instrument) => {
    if (!instrument.banks) {
      return true;
    }

    return instrument.banks.includes(payment.bank);
  },

  wallet: (payment, instrument) => {
    if (!instrument.wallets) {
      return true;
    }

    return instrument.wallets.includes(payment.wallet);
  },

  // Also used for paylater
  cardless_emi: (payment, instrument) => {
    if (!instrument.providers) {
      return true;
    }

    return instrument.providers.includes(payment.provider);
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
      return flows.includes('collect');
    }

    if (isQrPayment) {
      return flows.includes('qr');
    }

    if (isIntentPayment && flows.includes('intent')) {
      if (!apps) {
        return true;
      }

      return apps.includes(payment['_[app]']);
    }

    return false;
  },

  // Also used for emi
  card: validateCardInstrument,

  bank_transfer: () => true,
  paypal: () => true,
};

PAYMENT_VALIDATORS.paylater = PAYMENT_VALIDATORS.cardless_emi;
PAYMENT_VALIDATORS.app = PAYMENT_VALIDATORS.cardless_emi;
PAYMENT_VALIDATORS.emi = PAYMENT_VALIDATORS.card;
PAYMENT_VALIDATORS.emandate = PAYMENT_VALIDATORS.netbanking;

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

  return Promise.resolve(validated).catch(() => false);
}
