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
import { findCodeByNetworkName } from 'common/card';

import { wallets, getSortedWallets } from 'common/wallet';
import { extendConfig } from 'common/cardlessemi';
import { mobileQuery } from 'common/useragent';
import { getUPIIntentApps } from 'checkoutstore/native';

import { get as storeGetter } from 'svelte/store';
import { sequence as SequenceStore } from 'checkoutstore/screens/home';

const DEBIT_EMI_BANKS = ['HDFC_DC'];

const ALL_METHODS = {
  card() {
    if (getAmount() && getOption('method.card')) {
      if (isRecurring()) {
        return getRecurringMethods()?.card;
      }
      return getMerchantMethods().card;
    }
  },

  credit_card() {
    if (
      getAmount() &&
      getOption('method.card') &&
      getOption('method.credit_card')
    ) {
      return getMerchantMethods().credit_card;
    }
  },

  debit_card() {
    if (
      getAmount() &&
      getOption('method.card') &&
      getOption('method.debit_card')
    ) {
      return getMerchantMethods().debit_card;
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

  upi_otm() {
    return isUPIOTMBaseEnabled();
  },
};

export function isZestMoneyEnabled() {
  return isMethodEnabled('cardless_emi') && getCardlessEMIProviders().zestmoney;
}

export function isMethodEnabled(method) {
  const checker = ALL_METHODS[method];
  if (checker) {
    return checker();
  }
}

export function isCardOrEMIEnabled() {
  return isMethodEnabled('card') || isMethodEnabled('emi');
}

export function isDebitEMIEnabled() {
  const emiBanks = getEMIBanks();
  return DEBIT_EMI_BANKS |> _Arr.any(bank => emiBanks[bank]);
}

export function isContactRequiredForEMI(bank, cardType) {
  if (bank === 'HDFC_DC') {
    return true;
  }
  if (bank === 'HDFC' && cardType === 'debit') {
    return true;
  }
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
      'upi_otm',
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

export function getCardTypesForRecurring() {
  if (isRecurring()) {
    return getRecurringMethods().card;
  }
}

export function getCardNetworksForRecurring() {
  // "recurring": {
  //   "card": {
  //     "credit": ["MasterCard", "Visa", "American Express"]
  //   }
  // }
  if (isRecurring()) {
    // Using only credit cards as debit cards are only supported on some banks.
    const networks = getRecurringMethods().card?.credit;
    if (_.isArray(networks) && networks.length) {
      // Example: "American Express" to "amex"
      const codes = _Arr.map(networks, findCodeByNetworkName);

      // ["mastercard", "visa"] to { mastercard: true, visa: true }
      return _Arr.reduce(
        codes,
        (acc, code) => {
          acc[code] = true;
          return acc;
        },
        {}
      );
    }
  }
}

export function getCardIssuersForRecurring() {
  // "recurring": {
  //   "card": {
  //     "debit": {
  //       "CITI": "CITI Bank",
  //       "CNRB": "Canara Bank",
  //       "ICIC": "ICICI Bank",
  //       "KKBK": "Kotak Mahindra Bank"
  //     }
  //   }
  // }
  if (isRecurring()) {
    return getRecurringMethods().card?.debit;
  }
}

// additional checks for each sub-method based on UPI
const UPI_METHODS = {
  collect: () => true,
  omnichannel: () => !isPayout() && hasFeature('google_pay_omnichannel'),
  qr: () => getOption('method.qr') && !global.matchMedia(mobileQuery).matches,
  intent: () =>
    getMerchantMethods().upi_intent && getUPIIntentApps().all.length,
};

// additional checks for each sub-method based on UPI OTM
const UPI_OTM_METHODS = {
  collect: () => true,
  omnichannel: () => false,
  qr: () => false,
  intent: () => false,
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
    getAmount()
  );
}

function isUPIOTMBaseEnabled() {
  return (
    getOption('method.upi_otm') !== false &&
    getMerchantMethods().upi_otm &&
    // if amount less than 1L, or order has method=upi
    // order.method = upi with amount > 1L is passed
    // by mutual fund who can accept more than the standard limit
    (getAmount() < 1e7 || getMerchantOrder()?.method === 'upi_otm') &&
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

export function isUPIOtmFlowEnabled(method) {
  // unless method.upi_otm is passed as false by merchant
  // it should be considered enabled from merchant side
  const merchantOption = getOption('method.upi_otm');
  if (_.isNonNullObject(merchantOption) && merchantOption[method] === false) {
    return false;
  }
  return isUPIOTMBaseEnabled() && UPI_OTM_METHODS[method]();
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

export function getTPV() {
  const order = getMerchantOrder();
  if (!order) {
    return;
  }

  const bankCode = order.bank;
  const accountNumber = order.account_number;

  if (!bankCode || !accountNumber) {
    return;
  }
  const bankName = getNetbankingBanks()[bankCode] || `${bankCode} Bank`;

  let method = order.method;
  if (!method) {
    const hasNB = isMethodEnabled('netbanking');

    if (isMethodEnabled('upi')) {
      if (!hasNB) {
        method = 'upi';
      }
    } else if (hasNB) {
      method = 'netbanking';
    }
  }

  return {
    name: bankName,
    code: bankCode,
    account_number: accountNumber,
    image: 'https://cdn.razorpay.com/bank/' + bankCode + '.gif',
    method,
  };
}

export function isEMandateEnabled() {
  return isMethodEnabled('emandate');
}

export function getEMandateBanks() {
  let banks = getRecurringMethods().emandate;

  if (banks) {
    const authTypeFromOrder = getMerchantOrder()?.auth_type;
    if (authTypeFromOrder) {
      banks =
        banks
        |> _Obj.reduce((filteredBanks, bank, bankCode) => {
          if (bank.auth_types |> _Arr.contains(authTypeFromOrder)) {
            filteredBanks[bankCode] = bank;
          }
          return filteredBanks;
        }, {});
    }
  }

  return filterBanksOnAllowedAuthTypes(banks);
}

/**
 * Removes banks that do not have any supported auth types
 * @param {Object} banks
 * @returns {Object}
 */
function filterBanksOnAllowedAuthTypes(banks) {
  const allowedAuthTypes = ['netbanking', 'debitcard'];

  return (
    banks
    |> _Obj.reduce((filteredBanks, bank, bankCode) => {
      if (
        _Arr.any(bank.auth_types, authType =>
          _Arr.contains(allowedAuthTypes, authType)
        )
      ) {
        filteredBanks[bankCode] = bank;
      }
      return filteredBanks;
    }, {})
  );
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

/**
 * Tells whether a given bank is enabled for emandate
 * @param bank
 * @returns {boolean}
 */
export function isEMandateBankEnabled(bank) {
  return Boolean(getEMandateBanks()[bank]);
}

/**
 * Tells whether a given auth type is enabled for a given emandate bank
 * @param bank
 * @param authType
 *
 * @returns {boolean}
 */
export function isEMandateAuthTypeEnabled(bank, authType) {
  return getEMandateAuthTypes(bank) |> _Arr.contains(authType);
}

export function getEMIBankPlans(code, cardType = 'credit') {
  const options = code && getMerchantMethods().emi_options;
  if (options) {
    if (cardType === 'debit' && !_Str.endsWith(code, '_DC')) {
      // For Banks with EMI on Debit Cards,
      // code will end with "_DC".
      // Example: If the issuer is HDFC and card type is debit
      // Then use "HDFC_DC" plans and not "HDFC" plans.
      // If code is "HDFC_DC" then don't append "_DC" at the end.
      const debitCode = code + '_DC';
      if (DEBIT_EMI_BANKS |> _Arr.contains(debitCode)) {
        return options[debitCode];
      }
    }
    return options[code];
  }
}

export function getEligiblePlansBasedOnMinAmount(plans) {
  const amount = getAmount();
  const eligiblePlans = _Arr.filter(plans, plan => plan.min_amount <= amount);
  return eligiblePlans;
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
   * - amount > 1L
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
    getAmount() >= 1e5 * 100 ||
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
    enabledWallets
    |> _Arr.map(wallet => wallets[wallet])
    |> _Arr.filter(Boolean)
    |> getSortedWallets
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

/**
 * Returns the usable methods
 *
 * @returns {Array<string>}
 */
function getUsableMethods() {
  return storeGetter(SequenceStore);
}

/**
 * Some methods might not be usable because they are hidden
 * from the homescreen
 *
 * TODO: Should consider method instruments
 *
 * @param {string} method
 *
 * @returns {boolean}
 */
export function isMethodUsable(method) {
  return _Arr.contains(getUsableMethods(), method);
}
