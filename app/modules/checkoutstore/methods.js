/* global Set */
import Config, { FLOWS } from 'config';
import { get } from 'svelte/store';

import {
  isInternational,
  getAmount,
  isPayout,
  isASubscription,
} from 'checkoutstore';

import {
  getMerchantOrder,
  getMerchantOrderDueAmount,
  getOption,
  hasFeature,
  getCallbackUrl,
  getMerchantOrderAmount,
  getOrderMethod,
  getMerchantMethods,
  getRecurringMethods,
  isRecurring,
  isIRCTC,
  isCustomerFeeBearer,
  isPartialPayment,
  isOneClickCheckout,
} from 'razorpay';

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
  isFacebookWebView,
  getOS,
  isMobileByMediaQuery,
  getDevice,
  isMobile,
  android,
  AndroidWebView,
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
  partialPaymentAmount,
  partialPaymentOption,
} from 'checkoutstore/screens/home';

import { isWebPaymentsApiAvailable } from 'common/webPaymentsApi';
import { isNonNullObject } from 'utils/object';

function isNoRedirectFacebookWebViewSession() {
  return isFacebookWebView() && !getCallbackUrl();
}

const AUTH_TYPES = {
  NET_BANKING: 'netbanking',
  DEBIT_CARD: 'debitcard',
  ADHAAR: 'aadhaar',
};

const DEBIT_EMI_BANKS = ['HDFC_DC'];

const ALL_METHODS = {
  card() {
    if (getAmount() && getOption('method.card')) {
      if (isASubscription()) {
        return isASubscription('card') && getRecurringMethods()?.card;
      }

      if (isRecurring()) {
        return getRecurringMethods()?.card;
      }
      return getMerchantMethods().card;
    }
  },

  prepaid_card() {
    if (isRecurring()) {
      return getRecurringMethods()?.card?.prepaid;
    }
  },

  credit_card() {
    if (
      getAmount() &&
      getOption('method.card') &&
      getOption('method.credit_card')
    ) {
      if (isRecurring()) {
        return getRecurringMethods()?.card?.credit;
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
        return getRecurringMethods()?.card?.debit;
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
    if (isASubscription() && !isInternational()) {
      return isASubscription('emandate') && getRecurringMethods()?.emandate;
    }
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
    _Obj.loop(getMerchantMethods().app, (val) => {
      if (val) {
        areAppsEnabled = true;
      }
    });
    if (areAppsEnabled || isGpayMergedFlowEnabled()) {
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
    const orderAmount = getMerchantOrderAmount();
    const dueAmount = getMerchantOrderDueAmount();
    const partialPaymentOpt = get(partialPaymentOption);
    // get partial amount input
    const partialPaymentInput =
      partialPaymentOpt !== 'full' && get(partialPaymentAmount)
        ? parseFloat(get(partialPaymentAmount)) * 100
        : '';

    // if user made partial payment and try to make rest make sure dueAmount == originalAmount
    const amountCheck = dueAmount
      ? orderAmount === dueAmount && !partialPaymentInput
      : !partialPaymentInput;

    // if partial amount disable bank transfer
    const partialPaymentCheck =
      (isPartialPayment() && orderAmount === partialPaymentInput) ||
      amountCheck;

    return (
      !isRecurring() &&
      getAmount() &&
      getMerchantMethods().bank_transfer &&
      !isInternational() &&
      getOption('method.bank_transfer') &&
      partialPaymentCheck &&
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

  cod() {
    return (
      getOption('method.cod') &&
      getMerchantMethods().cod &&
      isOneClickCheckout()
    );
  },

  international() {
    return isApplicationEnabled('trustly') || isApplicationEnabled('poli');
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

  cod() {
    return true;
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
  const orderMethod = getOrderMethod();
  const fallbackChecker = (exactMethod) =>
    Boolean(
      ALL_METHODS[exactMethod] &&
        ALL_METHODS[exactMethod].call() &&
        isMethodEnabledForBrowser(exactMethod)
    );
  if (orderMethod && orderMethod !== method) {
    if (orderMethod === 'card' && method.includes(`_${orderMethod}`)) {
      // positive cases are credit_card/ debit_card/ prepaid_card
      // negative cases cardless_emi, hence added _card as a qualifier
      return fallbackChecker(method);
    }
    if (!(orderMethod === 'upi' && method === 'qr')) {
      return false;
    }
  }

  return fallbackChecker(method);
}

export function isCardOrEMIEnabled() {
  return isMethodEnabled('card') || isMethodEnabled('emi');
}

export function isDebitEMIEnabled() {
  const emiBanks = getEMIBanks();
  return DEBIT_EMI_BANKS.some((bank) => emiBanks[bank]);
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
  /* Please don't change the order, this code is order senstive */
  const consolidated_methods = [
    'card',
    'emi',
    'netbanking',
    'emandate',
    'nach',
    'upi_otm',
    'upi',
    'wallet',
    'paypal',
    'bank_transfer',
    'international',
  ];

  if (getOrderMethod()) {
    return getOrderMethod();
  }

  let oneMethod;
  let methods = getEnabledMethods();

  /**
   * @description This filtering is needed because we sub-divide methods as well, even though they are not valid instruments
   * @example credit_card for the card instrument
   */
  methods = methods.filter((method) => consolidated_methods.includes(method));

  if (methods.length === 1) {
    consolidated_methods.some((m) => {
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

// type: credit, prepaid
export function getCardNetworksForRecurring(type) {
  // "recurring": {
  //   "card": {
  //     "credit": ["MasterCard", "Visa", "American Express"]
  //   }
  // }
  if (isRecurring()) {
    // Using only credit cards as debit cards are only supported on some banks.
    const networks = getRecurringMethods().card[type];
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
    !isMobileByMediaQuery(),
  intent: () =>
    !isRecurring() &&
    !isPayout() &&
    getMerchantMethods().upi_intent &&
    getUPIIntentApps().all.length,
  intentUrl: () =>
    // available only on android mobile web (no-sdk, no-fb-insta)
    !isRecurring() &&
    !isPayout() &&
    !global.CheckoutBridge &&
    !AndroidWebView &&
    !isFacebookWebView() &&
    getMerchantMethods().upi_intent &&
    intentEnabledInOption() &&
    android,
};

// additional checks for each sub-method based on UPI OTM
const UPI_OTM_METHODS = {
  collect: () => true,
  omnichannel: () => false,
  qr: () => false,
  intent: () => false,
  intentUrl: () => false,
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
    (getAmount() <= 1e7 || getMerchantOrder()?.method === 'upi') &&
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
  if (isNonNullObject(merchantOption) && merchantOption[method] === false) {
    return false;
  }
  return isUPIBaseEnabled() && UPI_METHODS[method]();
}

function intentEnabledInOption() {
  const merchantUpiOption = getOption('method.upi');
  if (
    isNonNullObject(merchantUpiOption) &&
    merchantUpiOption.intent === false
  ) {
    return false;
  }
  return true;
}

export function isUPIOtmFlowEnabled(method) {
  // unless method.upi_otm is passed as false by merchant
  // it should be considered enabled from merchant side
  const merchantOption = getOption('method.upi_otm');
  if (isNonNullObject(merchantOption) && merchantOption[method] === false) {
    return false;
  }
  return isUPIOTMBaseEnabled() && UPI_OTM_METHODS[method]();
}

export function isApplicationEnabled(app) {
  const allCardApps = getCardApps().all || [];
  const merchantMethods = getMerchantMethods();

  switch (app) {
    case 'google_pay':
      return isGpayMergedFlowEnabled() && allCardApps.includes('google_pay');
    case 'cred':
      return isCREDEnabled();
    case 'trustly':
      /**
       * Trustly is an international app, will come under international payment methods
       * @returns boolean
       */
      return merchantMethods.app?.trustly;
    case 'poli':
      /**
       * Poli is an international app, will come under international payment methods
       * @returns boolean
       */
      return merchantMethods.app?.poli;
  }

  return false;
}

export function isCREDEnabled() {
  return getMerchantMethods().app?.cred;
}

/**
 * Checks if the google pay cards + upi merged flow is enabled.
 * @returns {Boolean} true|false
 */
export function isGpayMergedFlowEnabled() {
  return getMerchantMethods().gpay;
}

export function isCREDIntentFlowAvailable() {
  const cardApps = getCardApps();
  return (
    _Arr.contains(cardApps.all, 'cred') || isWebPaymentsApiAvailable('cred')
  );
}

export function getAgentPayload(option) {
  const { platform } = getSDKMeta();

  // for cred any mobile platform to send as mobile
  return {
    '_[agent][platform]': platform,
    '_[agent][device]': option?.cred
      ? getDevice() !== 'desktop'
        ? 'mobile'
        : 'desktop'
      : getDevice(),
    '_[agent][os]': getOS(),
  };
}

export function getPayloadForCRED() {
  const agentPayload = getAgentPayload({ cred: true }) || {};
  return {
    method: 'app',
    provider: 'cred',
    app_present: isCREDIntentFlowAvailable() ? 1 : 0,
    ...agentPayload,
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
    .filter((instrument) => instrument.method === 'app' && instrument.provider)
    .map((instrument) => instrument.provider);

  const filteredApps = apps.filter((app) => !disabledApps.includes(app));

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

/**
 * @typedef {Object} TPVResponse
 * @property {string} name Full name of the banks
 * @property {string} code Bank Code (should be used for transaction)
 * @property {string} account_number Bank Accounter number to verify
 * @property {URL} image logo/image of the bank
 * @property {string|undefined} method method to be used for transaction(which is validated against allowed methods) and will be undefined if both NB & UPI are allowed
 * @property {boolean} invalid boolean defining whether the TPV order has an error or not
 */

/**
 * This method returns the necessary payload required for transaction if the order is TPV order
 * @returns {undefined|TPVResponse}
 */
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
  let invalid;
  if (!method) {
    const hasNB = isMethodEnabled('netbanking');
    const hasUPI = isMethodEnabled('upi');
    const isOrderBankAllowedForNB = Boolean(getNetbankingBanks()[bankCode]);
    // if all the above three are true, keep method undefined as user can opt between NB & UPI

    switch (true) {
      case hasNB && isOrderBankAllowedForNB && !hasUPI:
        method = 'netbanking';
        break;
      case hasUPI && !(hasNB && isOrderBankAllowedForNB):
        method = 'upi';
        break;
      case !(hasUPI && hasNB && isOrderBankAllowedForNB):
        invalid = true;
        break;
    }
  }

  return {
    name: bankName,
    code: bankCode,
    account_number: accountNumber,
    image: 'https://cdn.razorpay.com/bank/' + bankCode + '.gif',
    method,
    invalid,
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
      banks = Object.entries(banks).reduce(
        (filteredBanks, [bankCode, bank]) => {
          if (bank.auth_types.includes(authTypeFromOrder)) {
            filteredBanks[bankCode] = bank;
          }
          return filteredBanks;
        },
        {}
      );
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
  const allowedAuthTypes = [
    AUTH_TYPES.NET_BANKING,
    AUTH_TYPES.DEBIT_CARD,
    AUTH_TYPES.ADHAAR,
  ];

  return Object.entries(banks).reduce((filteredBanks, [bankCode, bank]) => {
    if (
      bank.auth_types.some((authType) => allowedAuthTypes.includes(authType))
    ) {
      filteredBanks[bankCode] = bank;
    }
    return filteredBanks;
  }, {});
}

export function getEMandateAuthTypes(bankCode) {
  const authTypeFromOrder = getMerchantOrder()?.auth_type;

  /**
   * There may be multiple auth types present for each bank
   * but right now, we'll only support those that have
   * netbanking and debitcard as auth types.
   */
  return (
    getEMandateBanks()[bankCode]?.auth_types.filter((type) => {
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

  if (cardType === 'debit' && !code.endsWith('_DC')) {
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
  const eligiblePlans = _Arr.filter(plans, (plan) => plan.min_amount <= amount);
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
  if (isGpayMergedFlowEnabled()) {
    // Right now, we are checking on gpay method in preferences
    // and updating in the app if it is enabled. When it starts
    // coming in the `app` in preferences, we can remove this
    // explicitly setting of `google_pay`.
    apps.google_pay = true;
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

export function isWalnut369Enabled() {
  return Boolean(getMerchantMethods()?.cardless_emi?.walnut369);
}

export function getCardlessEMIProviders() {
  let emiMethod = {};
  if (getEMIBanks().BAJAJ) {
    emiMethod.bajaj = true;
  }
  emiMethod = {
    ...emiMethod,
    ...getMerchantMethods().cardless_emi,
  };
  if (emiMethod |> _Obj.isEmpty) {
    emiMethod = {};
  }

  let providers = getEligibleProvidersBasedOnMinAmount(getAmount(), emiMethod);

  if (isCustomerFeeBearer()) {
    providers = getEligibleProvidersForFeeBearerCustomer(providers);
  }
  return providers;
}

// * - amount > 1L filter
function filterWalletByAmount(wallets = []) {
  const amountGreaterThan1Lac = getAmount() >= 1e5 * 100;
  if (!amountGreaterThan1Lac) {
    // if amount is not greater than 1 lacs we return all wallets
    return wallets;
  }
  return wallets.filter((wallet) => {
    return Boolean(
      Config.wallet?.[wallet]?.[FLOWS.DISABLE_WALLET_AMOUNT_CHECK]
    );
  });
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
  const allWallets = getMerchantMethods()?.wallet || {}; // get all wallets
  let enabledWallets = filterWalletByAmount(Object.keys(allWallets));

  addExternalWallets(enabledWallets);

  if (
    !getAmount() ||
    passedWallets === false ||
    enabledWallets.length === 0 || // length will become 0 if amount check fails for all
    isRecurring() ||
    isInternational()
  ) {
    return [];
  }

  if (passedWallets && typeof passedWallets === 'object') {
    enabledWallets = enabledWallets.filter(
      (wallet) => passedWallets[wallet] !== false
    );
  }

  const noRedirectFacebookWebViewSession = isNoRedirectFacebookWebViewSession();

  const result = enabledWallets
    .map((wallet) => wallets[wallet])
    .filter((wallet) => {
      if (!wallet) {
        return false;
      }
      if (noRedirectFacebookWebViewSession) {
        // Only power wallets are supported on Facebook browser w/o callback_url
        return wallet.power;
      } else {
        return true;
      }
    });

  return getSortedWallets(result);
}

function addExternalWallets(enabledWallets) {
  getOption('external.wallets')
    |> _Obj.loop((externalWallet) => {
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
    .filter((instrument) => instrument._type === 'method')
    .map((instrument) => instrument.method);

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

/**
 * We need to disable vernacular for some methods because the APIs they use
 * are not ready yet. We also disable it if the `checkout_disable_i18n`
 * flag is present for the merchant.
 *
 * @returns {boolean}
 */
export function shouldUseVernacular() {
  return (
    !hasFeature('checkout_disable_i18n') &&
    !isPayout() &&
    !isMethodEnabled('nach')
  );
}

/**
 * Get all international app providers i.e. Trustly, Poli
 * @returns [providers]
 */
export function getInternationalProviders() {
  const method = 'international';

  if (!isMethodEnabled(method)) {
    return [];
  }

  const disableAllApps = storeGetter(HiddenMethodsStore).includes(method);
  const disabledInstruments = storeGetter(HiddenInstrumentsStore)
    .filter((instrument) => instrument.method === method)
    .map((instrument) => instrument.method);

  if (disableAllApps || disabledInstruments.includes(method)) {
    return [];
  }

  const apps = getAppsForMethod(method).filter((provider) =>
    isApplicationEnabled(provider.code)
  );

  return apps;
}
