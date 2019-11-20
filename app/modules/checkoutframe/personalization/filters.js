import { VPA_REGEX } from 'common/constants';
import { doesAppExist } from 'common/upi';
import DowntimesStore from 'checkoutstore/downtimes';

/**
 * Map of filter fn for each method
 * that says whether or not a given instrument
 * should be allowed.
 *
 * Format:
 * function (instrument: Object, availableMethods: Object): boolean
 */
const METHOD_FILTERS = {
  wallet: (instrument, availableMethods) => {
    const { wallet: wallets } = availableMethods;

    if (!wallets) {
      return false;
    }

    const enabledWallet = _Arr.any(
      wallets,
      wallet => wallet.code === instrument.wallet
    );

    return enabledWallet;
  },

  netbanking: (instrument, availableMethods) => {
    const { bank } = instrument;

    const { netbanking } = availableMethods;

    if (!netbanking) {
      return;
    }

    return Boolean(netbanking[bank]);
  },
};

/**
 * Filters out instruments and returns only those
 * that can be used for this payment.
 * @param {Array} instruments List of instruments
 * @param {Object} availableMethods Available methods
 *
 * @returns {Array}
 */
export const filterInstrumentsForAvailableMethods = _.curry2(
  (instruments, availableMethods) => {
    // TODO: Move Downtime logic to this function

    const allowed = _Arr.filter(instruments, instrument => {
      let { method } = instrument;

      if (instrument['_[upiqr]']) {
        method = 'qr';
      }

      if (availableMethods[method]) {
        if (METHOD_FILTERS[method]) {
          return METHOD_FILTERS[method](instrument, availableMethods);
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
  } = DowntimesStore.get();

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
    if (instrument.method === 'upi' && instrument['_[flow]'] === 'intent') {
      if (doesAppExist(instrument.upi_app, apps)) {
        return true;
      }

      return false;
    }

    return true;
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
 *
 * @returns {Array} filtered instruments
 */
export function filterInstruments({ instruments, methods, upiApps = [] }) {
  return (
    instruments
    |> filterInstrumentsForAvailableMethods(methods)
    |> filterInstrumentsByAvailableUpiApps(upiApps)
    |> filterInstrumentsForSanity
    |> filterInstrumentsForDowntime
  );
}
