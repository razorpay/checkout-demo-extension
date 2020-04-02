import {
  isRecurring,
  isInternational,
  getMerchantMethods,
  getRecurringMethods,
  getMerchantOrder,
  getOption,
  getAmount,
  isIRCTC,
  hasFeature,
  isPayout,
  isOfferForced,
} from 'checkoutstore';

import {
  getEligibleBanksBasedOnMinAmount,
  getMinimumAmountFromPlans,
  getEMIBank,
} from 'common/emi';

import { getEligibleProvidersBasedOnMinAmount } from 'common/cardlessemi';
import { getProvider } from 'common/paylater';

import { wallets } from 'common/wallet';
import { extendConfig } from 'common/cardlessemi';
import { mobileQuery } from 'common/useragent';
import { getUPIIntentApps } from 'checkoutframe';

const ALL_METHODS = {
  card() {
    if (getAmount() && getOption('method.card')) {
      if (isRecurring()) {
        return getRecurringMethods()?.card;
      }
      return getMerchantMethods().card;
    }
  },

  netbanking() {
    return (
      getAmount() &&
        !isRecurring() &&
        !isInternational() &&
        getOption('method.netbanking') !== false &&
        getNetbankingBanks()
      |> _Obj.keys
      |> _.lengthOf
    );
  },

  wallet() {
    return getWallets().length;
  },

  nach() {
    return (
      !getAmount() &&
      getMerchantOrder()?.method === 'nach' &&
      getRecurringMethods()?.nach
    );
  },

  emandate() {
    return (
      !isMethodEnabled('nach') &&
      !isInternational() &&
      !getAmount() &&
      !_Obj.isEmpty(getRecurringMethods()?.emandate)
    );
  },

  emi() {
    /**
     * disable EMI if:
     * - Non INR payment
     * - Recurring payment
     * - No EMI banks are present
     * - Either of Card or EMI methods are disabled
     */
    return (
      getAmount() &&
      getOption('method.emi') &&
      getMerchantMethods().emi &&
      getMerchantMethods().card &&
      !isInternational() &&
      !isRecurring() &&
      !_Obj.isEmpty(getEMIBanks())
    );
  },

  upi() {
    return Object.keys(UPI_METHODS).some(isUPIFlowEnabled);
  },

  qr() {
    return isUPIFlowEnabled('qr');
  },

  cardless_emi() {
    if (!getAmount() || isInternational() || isRecurring()) {
      return false;
    }
    const providers = getCardlessEMIProviders();
    const enabled =
      getOption('method.cardless_emi') !== false || providers.bajaj;
    return enabled && !_Obj.isEmpty(providers);
  },

  paylater() {
    /**
     * Disable PayLater if either:
     * - Empty array
     * - international
     * TODO: Allow this for prefill and logged in users.
     */
    return (
      getAmount() &&
      !isRecurring() &&
      !isInternational() &&
      !_Obj.isEmpty(getMerchantMethods().paylater)
    );
  },

  bank_transfer() {
    return (
      !isRecurring() &&
      getAmount() &&
      getMerchantMethods().bank_transfer &&
      !isInternational() &&
      getOption('method.bank_transfer') &&
      getOption('order_id')
    );
  },

  paypal() {
    return (
      !isRecurring() && isInternational() && getMerchantMethods().wallet?.paypal
    );
  },

  gpay() {
    return isUPIBaseEnabled() && isIRCTC();
  },
};

export function isMethodEnabled(method) {
  const checker = ALL_METHODS[method];
  if (checker) {
    return checker();
  }
}

export function isCardOrEMIEnabled() {
  return isMethodEnabled('card') || isMethodEnabled('emi');
}

/*
 * @returns {Array} of enabled methods
 */
export function getEnabledMethods() {
  return ALL_METHODS |> _Obj.keys |> _Arr.filter(isMethodEnabled);
}

export function getSingleMethod() {
  let oneMethod;
  const methods = getEnabledMethods();

  if (methods.length === 1) {
    /* Please don't change the order, this code is order senstive */
    [
      'card',
      'emi',
      'netbanking',
      'emandate',
      'nach',
      'upi',
      'wallet',
      'paypal',
    ]
      |> _Arr.any(m => {
        if (m === methods[0]) {
          oneMethod = m;
          return true;
        }
      });
    return oneMethod;
  }
}

export function isAMEXEnabled() {
  return getMerchantMethods().amex;
}

export function isCreditCardEnabled() {
  return isRecurring()
    ? getRecurringMethods().card?.credit
    : getMerchantMethods().credit_card;
}

export function isDebitCardEnabled() {
  return isRecurring()
    ? getRecurringMethods().card?.debit
    : getMerchantMethods().debit_card;
}

// additional checks for each sub-method based on UPI
const UPI_METHODS = {
  collect: () => true,
  omnichannel: () => !isPayout() && hasFeature('google_pay_omnichannel'),
  qr: () => getOption('method.qr') && !global.matchMedia(mobileQuery).matches,
  intent: () =>
    getMerchantMethods().upi_intent && getUPIIntentApps().all.length,
};

// check if upi itself is enabled, before checking any
// of the individual methods
function isUPIBaseEnabled() {
  return (
    getOption('method.upi') !== false &&
    getMerchantMethods().upi &&
    // if amount less than 1L, or order has method=upi
    // order.method = upi with amount > 1L is passed
    // by mutual fund who can accept more than the standard limit
    (getAmount() < 1e7 || getMerchantOrder()?.method === 'upi') &&
    !isInternational() &&
    !isRecurring() &&
    getAmount()
  );
}

export function isUPIFlowEnabled(method) {
  // unless method.upi or method.upi.{sub-method} is passed as false by merchant
  // it should be considered enabled from merchant side
  const merchantOption = getOption('method.upi');
  if (_.isNonNullObject(merchantOption) && merchantOption[method] === false) {
    return false;
  }
  return isUPIBaseEnabled() && UPI_METHODS[method]();
}

export function getCardNetworks() {
  return _Obj.getSafely(getMerchantMethods(), 'card_networks', {});
}

export function getNetbankingBanks() {
  const banks = getMerchantMethods().netbanking;
  if (_Obj.isEmpty(banks)) {
    return {};
  }
  return banks;
}

export function isEMandateEnabled() {
  return isMethodEnabled('emandate');
}

export function getEMandateBanks() {
  const banks = getRecurringMethods().emandate;
  if (banks) {
    const authTypeFromOrder = getMerchantOrder()?.auth_type;
    if (authTypeFromOrder) {
      return (
        banks
        |> _Obj.reduce((filteredBanks, bank, bankCode) => {
          if (bank.auth_types |> _Arr.contains(authTypeFromOrder)) {
            filteredBanks[bankCode] = bank;
          }
          return filteredBanks;
        }, {})
      );
    }
  }
  return banks;
}

export function getEMandateAuthTypes(bankCode) {
  const authTypeFromOrder = getMerchantOrder()?.auth_type;

  /**
   * There may be multiple auth types present for each bank
   * but right now, we'll only support those that have
   * netbanking and debitcard as auth types.
   */
  return (
    getEMandateBanks()[bankCode]?.auth_types.filter(type => {
      /**
       * If an auth_type is there in order,
       * we only show banks with that auth_type
       */
      if (authTypeFromOrder) {
        return type === authTypeFromOrder;
      }

      return type === 'netbanking' || type === 'debitcard';
    }) || []
  );
}

export function getEMIBankPlans(code) {
  const options = code && getMerchantMethods().emi_options;
  if (options) {
    return options[code];
  }
}

// @TODO modifies bajaj cardless emi min_amount
export function getEMIBanks() {
  const emiOptions = getMerchantMethods().emi_options;

  if (emiOptions |> _Obj.isEmpty) {
    return {};
  }

  const banks =
    getEligibleBanksBasedOnMinAmount(getAmount(), emiOptions)
    |> _Obj.map((plans, bankCode) => {
      return {
        ...getEMIBank(bankCode),
        plans,
        min_amount: getMinimumAmountFromPlans(plans),
      };
    });

  // Minimum amount for BAJAJ is sent from API
  if (banks.BAJAJ) {
    extendConfig('bajaj', {
      min_amount: banks.BAJAJ.min_amount,
    });
  }

  return banks;
}

/*
  @returns {Array} of providers
 */
export function getPayLaterProviders() {
  const paylater = getMerchantMethods().paylater;
  if (paylater |> _Obj.isEmpty) {
    return [];
  }
  return paylater |> _Obj.keys |> _Arr.map(getProvider) |> _Arr.filter(_ => _);
}

export function getCardlessEMIProviders() {
  let emiMethod = getMerchantMethods().cardless_emi;
  if (emiMethod |> _Obj.isEmpty) {
    emiMethod = {};
  }

  if (getEMIBanks().BAJAJ) {
    emiMethod.bajaj = true;
  }

  return getEligibleProvidersBasedOnMinAmount(getAmount(), emiMethod);
}

export function getWallets() {
  /**
   * disable wallets if:
   * - amount > 20k
   * - Wallets not enabled by backend
   * - Recurring payment
   * - International
   * Also, enable/disable wallets on the basis of merchant options
   */
  const passedWallets = getOption('method.wallet');
  let enabledWallets = getMerchantMethods().wallet |> _Obj.keys;

  addExternalWallets(enabledWallets);

  if (
    !getAmount() ||
    passedWallets === false ||
    getAmount() >= 20000 * 100 ||
    isRecurring() ||
    isInternational()
  ) {
    return [];
  }

  if (_.isNonNullObject(passedWallets)) {
    enabledWallets =
      enabledWallets |> _Arr.filter(wallet => passedWallets[wallet] !== false);
  }
  return (
    enabledWallets |> _Arr.map(wallet => wallets[wallet]) |> _Arr.filter(_ => _)
  );
}

function addExternalWallets(enabledWallets) {
  getOption('external.wallets')
    |> _Obj.loop(externalWallet => {
      if (wallets[externalWallet]) {
        wallets[externalWallet].custom = true;
        if (!(enabledWallets |> _Arr.contains(externalWallet))) {
          enabledWallets.unshift(externalWallet);
        }
      }
    });
}
