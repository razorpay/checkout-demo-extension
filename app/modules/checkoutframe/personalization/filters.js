import { VPA_REGEX } from 'common/constants';
import { doesAppExist } from 'common/upi';
import { shouldRememberCustomer } from 'checkoutstore';
import { isRecurring, getAmount } from 'razorpay';
import {
  isCreditCardEnabled,
  isDebitCardEnabled,
  isMethodEnabled,
  getWallets,
  getNetbankingBanks,
  isApplicationEnabled,
  isCardLessEmiProviderEnabled,
} from 'checkoutstore/methods';
import { getProvider as getCardlessEMIProvider } from 'common/cardlessemi';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';

import { highlightUPIIntentOnDesktop } from 'upi/experiments';
import { get } from 'svelte/store';
import { qrRenderState } from 'upi/ui/components/QRWrapper/store';

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
    // Only international cards are supported as of now for recurring
    // but in p13n any card can come, so this should be filtered out
    if (isRecurring()) {
      return false;
    }

    const logged = ObjectUtils.get(customer, 'logged');

    const allowedTypes = {
      credit: isCreditCardEnabled(),
      debit: isDebitCardEnabled(),
    };

    const isCardTypeAllowed = allowedTypes[instrument.type];

    // If the card type is not allowed, filter this out
    if (!isCardTypeAllowed) {
      return false;
    }

    // Don't show any cards if saved cards are disabled
    if (!shouldRememberCustomer()) {
      return false;
    }

    // Don't show cards for logged out users
    if (!logged) {
      return false;
    }

    const tokens = ObjectUtils.get(customer, 'tokens.items', []);

    // Allow this instrument only if a token for this exists on the customer
    return tokens.some((token) => instrument.token_id === token.id);
  },

  wallet: (instrument) => {
    const wallets = getWallets();

    if (!wallets) {
      return false;
    }

    const enabledWallet = wallets.some(
      (wallet) => wallet.code === instrument.wallet
    );

    return enabledWallet;
  },

  netbanking: (instrument) => {
    const { bank } = instrument;

    if (!isMethodEnabled('netbanking')) {
      return;
    }

    return Boolean(getNetbankingBanks()[bank]);
  },

  upi: (instrument, { customer }) => {
    const isUPIQROnL0 = get(qrRenderState).homeScreenQR;
    // We allow upi id linked to only few banks for recurring.
    // In p13n intent and qr user can attempt payment with
    // non supported apps, so this should be filtered out.
    if (
      isRecurring() &&
      (instrument['_[upiqr]'] || instrument['_[flow]'] === 'intent')
    ) {
      return false;
    }

    // Only allow directpay instruments that have a VPA
    if (instrument['_[flow]'] === 'directpay') {
      if (instrument.vpa) {
        // We want to show only saved VPAs
        const tokens = ObjectUtils.get(customer, 'tokens.items', []);
        const tokenVpas = tokens
          .filter((token) => token.vpa)
          .map((token) => `${token.vpa.username}@${token.vpa.handle}`);

        return tokenVpas.indexOf(instrument.vpa) >= 0;
      }
      return false;
    }

    // Allow QR instruments
    if (instrument['_[upiqr]']) {
      /**
       * If QR-V2 is rendered on home-screen,
       * We should not show the same instrument in p13n
       */
      return !isUPIQROnL0;
    }

    // Allow intent instruments with an app name
    if (instrument['_[flow]'] === 'intent' && !isUPIQROnL0) {
      return Boolean(instrument.upi_app);
    }

    return false;
  },

  app(instrument) {
    return isApplicationEnabled(instrument.provider);
  },

  cardless_emi: (instrument) => {
    if (!instrument || !instrument.provider) {
      return false;
    }

    return isCardLessEmiProviderEnabled(instrument.provider);
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

    const allowed = instruments.filter((instrument) => {
      let { method } = instrument;

      if (instrument['_[upiqr]']) {
        method = 'qr';
      }

      if (isMethodEnabled(method)) {
        /**
         * QR instruments filter logic is added in upi method filter itself
         * hence the override
         */
        if (method === 'qr') {
          method = 'upi';
        }
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
  upi: (instrument) => {
    if (
      instrument['_[flow]'] === 'directpay' &&
      instrument.vpa &&
      !VPA_REGEX.test(instrument.vpa)
    ) {
      return false;
    }

    return true;
  },
  cardless_emi: (instrument) => {
    if (!isCardLessEmiProviderEnabled(instrument.provider)) {
      return false;
    }
    // check for min_amount for cardless_emi
    const provider = getCardlessEMIProvider(instrument.provider);
    const minAmount = provider.min_amount || 0;
    const amount = getAmount();
    return amount >= minAmount;
  },
};

/**
 * Filters instruments by performing sanity checks on them.
 * @param {Array} instruments List of intruments to be filtered
 *
 * @returns {Array} filtered instruments
 */
export function filterInstrumentsForSanity(instruments) {
  return instruments.filter((instrument) => {
    if (SANITY_FILTERS[instrument.method]) {
      return SANITY_FILTERS[instrument.method](instrument);
    }

    return true;
  });
}

/**
 * Filters instruments by are falsy in nature.
 * @param {Array} instruments List of intruments to be filtered
 *
 * @returns {Array} filtered instruments
 */
export function filterFalsyInstruments(instruments) {
  return instruments.filter(Boolean);
}

/**
 * Returns the list of instruments filtered for available UPI apps
 * @param {Array} instruments List of instruments
 * @param {Array} apps List of UPI apps
 *
 * @returns {Array}
 */
const filterInstrumentsByAvailableUpiApps = _.curry2((instruments, apps) => {
  return instruments.filter((instrument) => {
    if (instrument.method !== 'upi') {
      return true;
    }

    if (instrument['_[flow]'] !== 'intent') {
      return true;
    }

    if (instrument?.vendor_vpa && highlightUPIIntentOnDesktop.enabled()) {
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
    |> filterFalsyInstruments
    |> filterInstrumentsForAvailableMethods({ customer })
    |> filterInstrumentsByAvailableUpiApps(upiApps)
    |> filterInstrumentsForSanity
  );
}
