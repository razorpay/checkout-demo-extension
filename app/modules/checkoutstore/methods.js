/* global Set */

import {
  isRecurring,
  isInternational,
  getMerchantMethods,
  getRecurringMethods,
  getMerchantOrder,
  getOrderMethod,
  getOption,
  getAmount,
  isIRCTC,
  hasFeature,
  isPayout,
  isOfferForced,
  isASubscription,
  getCallbackUrl,
  isCustomerFeeBearer,
} from 'checkoutstore';

import {
  getEligibleBanksBasedOnMinAmount,
  getMinimumAmountFromPlans,
  getEMIBank,
} from 'common/emi';

import {
  getEligibleProvidersBasedOnMinAmount,
  getEligibleProvidersForFeeBearerCustomer,
} from 'common/cardlessemi';
import { getProvider } from 'common/paylater';
import { getAppsForMethod, getProvider as getAppProvider } from 'common/apps';
import { findCodeByNetworkName } from 'common/card';

import { wallets, getSortedWallets } from 'common/wallet';
import { extendConfig } from 'common/cardlessemi';
import {
  mobileQuery,
  isFacebookWebView,
  getOS,
  getDevice,
} from 'common/useragent';
import {
  getUPIIntentApps,
  getCardApps,
  getSDKMeta,
} from 'checkoutstore/native';

import { get as storeGetter } from 'svelte/store';
import {
  sequence as SequenceStore,
  instruments as InstrumentsStore,
  hiddenInstruments as HiddenInstrumentsStore,
  hiddenMethods as HiddenMethodsStore,
} from 'checkoutstore/screens/home';

function isNoRedirectFacebookWebViewSession() {
  return isFacebookWebView() && !getCallbackUrl();
}

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
      if (isRecurring()) {
        return getRecurringMethods()?.credit_card;
      }
      return getMerchantMethods().credit_card;
    }
  },

  debit_card() {
    if (
      getAmount() &&
      getOption('method.card') &&
      getOption('method.debit_card')
    ) {
      if (isRecurring()) {
        return getRecurringMethods()?.debit_card;
      }
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
      getOrderMethod() === 'emandate' &&
      !isInternational() &&
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
    const isAnyUpiFlowEnabled = Object.keys(UPI_METHODS).some(isUPIFlowEnabled);
    if (isASubscription()) {
      return (
        isASubscription('upi') &&
        getRecurringMethods()?.upi &&
        isAnyUpiFlowEnabled
      );
    } else if (isRecurring()) {
      return getRecurringMethods()?.upi && isAnyUpiFlowEnabled;
    }
    return isAnyUpiFlowEnabled;
  },

  app() {
    let areAppsEnabled = false;
    _Obj.loop(getMerchantMethods().app, val => {
      if (val) {
        areAppsEnabled = true;
      }
    });
    if (areAppsEnabled || getMerchantMethods().google_pay_cards) {
      return true;
    }
    return false;
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

/**
 * Only some methods are to be used on Facebook Browser
 * when callback_url is not passed.
 * This is done because we can't open popups on Facebook Browser.
 */
const METHOD_ON_FACEBOOK_BROWSER_NO_REDIRECT_CHECKER = {
  credit_card() {
    return true;
  },

  debit_card() {
    return true;
  },

  card() {
    return true;
  },

  upi() {
    return true;
  },

  wallet() {
    return getWallets().length > 0;
  },
};

function isMethodEnabledForBrowser(method) {
  // On Facebook browser, we can only use some methods when we have to use popup.
  if (isNoRedirectFacebookWebViewSession()) {
    const checker = METHOD_ON_FACEBOOK_BROWSER_NO_REDIRECT_CHECKER[method];

    if (checker) {
      return checker();
    } else {
      return false;
    }
  } else {
    return true;
  }
}

export function isMethodEnabled(method) {
  if (getOrderMethod()) {
    if (getOrderMethod() !== method) {
      return false;
    }
  }

  const checker = ALL_METHODS[method];
  if (checker) {
    return checker() && isMethodEnabledForBrowser(method);
  } else {
    return false;
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
  const merchantOrder = getMerchantOrder();
  let merchantOrderMethod = merchantOrder?.method;
  if (merchantOrder && isRecurring() && getAmount()) {
    merchantOrderMethod = merchantOrder.method || 'card';
  }
  let methodsToConsider = ALL_METHODS |> _Obj.keys;

  if (merchantOrderMethod) {
    methodsToConsider = [merchantOrderMethod];
  }
  return methodsToConsider |> _Arr.filter(isMethodEnabled);
}

export function getSingleMethod() {
  if (getOrderMethod()) {
    return getOrderMethod();
  }

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
  omnichannel: () =>
    !isRecurring() && !isPayout() && hasFeature('google_pay_omnichannel'),
  qr: () =>
    !isRecurring() &&
    !isPayout() &&
    getOption('method.qr') &&
    !global.matchMedia(mobileQuery).matches,
  intent: () =>
    !isRecurring() &&
    !isPayout() &&
    getMerchantMethods().upi_intent &&
    getUPIIntentApps().all.length,
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

export function isApplicationEnabled(app) {
  const cardApps = getCardApps();
  const merchantMethods = getMerchantMethods();

  switch (app) {
    case 'google_pay_cards':
      return (
        merchantMethods.google_pay_cards &&
        _Arr.contains(cardApps.all, 'google_pay_cards')
      );
    case 'cred':
      return isCREDEnabled();
  }

  return false;
}

function isCREDEnabled() {
  return getMerchantMethods().app?.cred;
}

export function isCREDIntentFlowAvailable() {
  const cardApps = getCardApps();
  return _Arr.contains(cardApps.all, 'cred');
}

export function getPayloadForCRED() {
  const { platform } = getSDKMeta();
  return {
    method: 'app',
    provider: 'cred',
    app_present: isCREDIntentFlowAvailable() ? 1 : 0,
    '_[agent][platform]': platform,
    '_[agent][device]': getDevice(),
    '_[agent][os]': getOS(),
  };
}

export function isContactRequiredForInstrument(instrument) {
  if (
    instrument.method === 'app' &&
    instrument.providers?.length === 1 &&
    instrument.providers[0] === 'cred'
  ) {
    return true;
  }

  return false;
}

export function isContactRequiredForAppProvider(code) {
  if (code === 'cred') {
    return true;
  }

  return false;
}

export function getAppsForCards() {
  if (!isMethodEnabled('card')) {
    return [];
  }

  const disableAllApps = storeGetter(HiddenMethodsStore).includes('app');
  if (disableAllApps) {
    return [];
  }

  const apps = getAppsForMethod('card') |> _Arr.filter(isApplicationEnabled);

  const disabledApps = storeGetter(HiddenInstrumentsStore)
    .filter(instrument => instrument.method === 'app' && instrument.provider)
    .map(instrument => instrument.provider);

  const filteredApps = apps.filter(app => !disabledApps.includes(app));

  return filteredApps;
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

      return (
        type === 'netbanking' || type === 'debitcard' || type === 'aadhaar'
      );
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

/**
 * Returns the EMI plans for the given bank.
 *
 * @param {string} code the code for the bank
 * @param {string} cardType the type of the card (credit or debit)
 * @param {boolean} noCostEmi whether to include no cost EMI plans
 * @return {Array<Object>|undefined}
 */
export function getEMIBankPlans(code, cardType = 'credit', noCostEmi = true) {
  const options = getMerchantMethods().emi_options;
  const emiPlans = getMerchantMethods().emi_plans;

  if (!options || !emiPlans) {
    return;
  }

  if (cardType === 'debit' && !_Str.endsWith(code, '_DC')) {
    // For Banks with EMI on Debit Cards,
    // code will end with "_DC".
    // Example: If the issuer is HDFC and card type is debit
    // Then use "HDFC_DC" plans and not "HDFC" plans.
    // If code is "HDFC_DC" then don't append "_DC" at the end.
    const debitCode = code + '_DC';
    if (DEBIT_EMI_BANKS |> _Arr.contains(debitCode)) {
      code = debitCode;
    } else {
      return;
    }
  }

  const plans = noCostEmi ? options[code] : transformEmiPlans(emiPlans[code]);

  if (!plans) {
    return;
  }

  return plans.sort((a, b) => a.duration - b.duration);
}

/**
 * Transforms emi plans from an object with key as the duration and
 * value as the interest to an array of objects.
 *
 * @param {Object} emiPlan
 * @returns {Array<Object>}
 */
function transformEmiPlans(emiPlan) {
  const { plans } = emiPlan;
  return Object.entries(plans).map(([duration, interest]) => {
    return {
      duration,
      interest,
      subvention: 'customer',
      min_amount: emiPlan.min_amount,
    };
  });
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
  return paylater |> _Obj.keys |> _Arr.map(getProvider) |> _Arr.filter(Boolean);
}

/*
  @returns {Array} of providers
 */
export function getAppProviders() {
  const merchantMethods = getMerchantMethods();
  const apps = _Obj.clone(merchantMethods.app || {});
  if (merchantMethods.google_pay_cards) {
    // Older preferences format for Google Pay Cards,
    // if preferences.app contains google_pay_cards,
    // then remove this hardcoded flag.
    apps.google_pay_cards = true;
  }
  if (apps |> _Obj.isEmpty) {
    return [];
  }
  return (
    apps
    |> _Obj.keys
    |> _Arr.filter(isApplicationEnabled)
    |> _Arr.map(getAppProvider)
    |> _Arr.filter(Boolean)
  );
}

export function getCardlessEMIProviders() {
  let emiMethod = getMerchantMethods().cardless_emi;
  if (emiMethod |> _Obj.isEmpty) {
    emiMethod = {};
  }

  if (getEMIBanks().BAJAJ) {
    emiMethod.bajaj = true;
  }

  let providers = getEligibleProvidersBasedOnMinAmount(getAmount(), emiMethod);

  if (isCustomerFeeBearer()) {
    providers = getEligibleProvidersForFeeBearerCustomer(providers);
  }

  return providers;
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

  const noRedirectFacebookWebViewSession = isNoRedirectFacebookWebViewSession();

  return (
    enabledWallets
    |> _Arr.map(wallet => wallets[wallet])
    |> _Arr.filter(Boolean)
    |> _Arr.filter(wallet => {
      if (noRedirectFacebookWebViewSession) {
        // Only power wallets are supported on Facebook browser w/o callback_url
        return wallet.power;
      } else {
        return true;
      }
    })
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
  const instruments = storeGetter(InstrumentsStore);
  const methodsFromInstruments = instruments
    .filter(instrument => instrument._type === 'method')
    .map(instrument => instrument.method);

  // SequenceStore has methods that are available but not shown on the homescreen (eg: EMI on Cards)
  const sequenceMethods = storeGetter(SequenceStore);

  const methods = methodsFromInstruments.concat(sequenceMethods);

  // Remove duplicates
  return _Arr.removeDuplicates(methods);
}

/**
 * Some methods might not be usable because they are hidden
 * from the homescreen
 *
 * @param {string} method
 *
 * @returns {boolean}
 */
export function isMethodUsable(method) {
  return _Arr.contains(getUsableMethods(), method);
}
