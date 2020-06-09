import { VPA_REGEX } from 'common/constants';
import { doesAppExist } from 'common/upi';
import { getDowntimes } from 'checkoutstore';
import {
  isCreditCardEnabled,
  isDebitCardEnabled,
  isMethodEnabled,
  getWallets,
  getNetbankingBanks,
} from 'checkoutstore/methods';

/**
 * Map of filter fn for each method
 * that says whether or not a given instrument
 * should be allowed.
 *
 * Format:
 * function (instrument: Object, meta: Object): boolean
 */
const METHOD_FILTERS = {
  card: (instrument, { customer }) => {
    const logged = _Obj.getSafely(customer, 'logged');

    const allowedTypes = {
      credit: isCreditCardEnabled(),
      debit: isDebitCardEnabled(),
    };

    const isCardTypeAllowed = allowedTypes[instrument.type];

    // If the card type is not allowed, filter this out
    if (!isCardTypeAllowed) {
      return false;
    }

    // For logged out users, show all possible card instruments
    if (!logged) {
      return true;
    }

    const tokens = _Obj.getSafely(customer, 'tokens.items', []);

    // Allow this instrument only if a token for this exists on the customer
    return _Arr.any(tokens, token => instrument.token_id === token.id);
  },

  wallet: instrument => {
    const wallets = getWallets();

    if (!wallets) {
      return false;
    }

    const enabledWallet = _Arr.any(
      wallets,
      wallet => wallet.code === instrument.wallet
    );

    return enabledWallet;
  },

  netbanking: instrument => {
    const { bank } = instrument;

    if (!isMethodEnabled('netbanking')) {
      return;
    }

    return Boolean(getNetbankingBanks()[bank]);
  },

  upi: instrument => {
    // Only allow directpay instruments that have a VPA
    if (instrument['_[flow]'] === 'directpay') {
      return Boolean(instrument.vpa);
    }

    // Allow QR instruments
    if (instrument['_[upiqr]']) {
      return true;
    }

    // Allow intent instruments with an app name
    if (instrument['_[flow]'] === 'intent') {
      return Boolean(instrument.upi_app);
    }

    return false;
  },
};

/**
 * Filters out instruments and returns only those
 * that can be used for this payment.
 * @param {Array} instruments List of instruments
 * @param {Object} meta Meta info
 *  @prop {Object} methods Available methods
 *  @prop {Customer} customer
 *
 * @returns {Array}
 */
export const filterInstrumentsForAvailableMethods = _.curry2(
  (instruments, { customer }) => {
    // TODO: Move Downtime logic to this function

    const allowed = _Arr.filter(instruments, instrument => {
      let { method } = instrument;

      if (instrument['_[upiqr]']) {
        method = 'qr';
      }

      if (isMethodEnabled(method)) {
        if (METHOD_FILTERS[method]) {
          return METHOD_FILTERS[method](instrument, { customer });
        }

        return true;
      }

      return false;
    });

    return allowed;
  }
);

const SANITY_FILTERS = {
  upi: instrument => {
    if (instrument.source === 'api') {
      return true;
    }

    if (instrument.vpa && !VPA_REGEX.test(instrument.vpa)) {
      return false;
    }

    return true;
  },
};

/**
 * Filters instruments by performing sanity checks on them.
 * @param {Array} instruments List of intruments to be filtered
 *
 * @returns {Array} filtered instruments
 */
export function filterInstrumentsForSanity(instruments) {
  return _Arr.filter(instruments, instrument => {
    if (SANITY_FILTERS[instrument.method]) {
      return SANITY_FILTERS[instrument.method](instrument);
    }

    return true;
  });
}

/**
 * Filters out instruments before listing down instruments for display
 *
 * @param  {Array} instruments is the list of instruments to be filtered.
 * @return {Array} filtered our instruments
 */
export function filterInstrumentsForDowntime(instruments) {
  const {
    high: {
      methods: methodsWithHighDowntime = [],
      banks: banksWithHighDowntime = [],
    },
  } = getDowntimes();

  return _Arr.filter(instruments, instrument => {
    // Remove instruments for which there is a high severity downtime
    if (_Arr.contains(methodsWithHighDowntime, instrument.method)) {
      return false;
    }

    switch (instrument.method) {
      case 'netbanking':
        // If the instrument is netbanking, remove it if it has a severe downtime
        if (_Arr.contains(banksWithHighDowntime, instrument.bank)) {
          return false;
        }
        break;
    }

    return true;
  });
}

/**
 * Returns the list of instruments filtered for available UPI apps
 * @param {Array} instruments List of instruments
 * @param {Array} apps List of UPI apps
 *
 * @returns {Array}
 */
const filterInstrumentsByAvailableUpiApps = _.curry2((instruments, apps) => {
  return _Arr.filter(instruments, instrument => {
    if (instrument.method !== 'upi') {
      return true;
    }

    if (instrument['_[flow]'] !== 'intent') {
      return true;
    }

    if (instrument['_[upiqr]'] === '1') {
      return true;
    }

    return doesAppExist(instrument.upi_app, apps);
  });
});

/**
 * Filters instruments for
 * - Sanity
 * - Downtime
 *
 * @param {Object} params
 *  @prop {Array} instruments
 *  @prop {Object} methods
 *  @prop {Array} upiApps List of UPI apps on the device
 *  @prop {Customer} customer
 *
 * @returns {Array} filtered instruments
 */
export function filterInstruments({ instruments, upiApps = [], customer }) {
  return (
    instruments
    |> filterInstrumentsForAvailableMethods({ customer })
    |> filterInstrumentsByAvailableUpiApps(upiApps)
    |> filterInstrumentsForSanity
    |> filterInstrumentsForDowntime
  );
}
