import RazorpayConfig from 'common/RazorpayConfig';
import { getCardMetadata } from 'common/card';
import * as _ from 'utils/_';
import * as ObjectUtils from 'utils/object';
import { getSession } from 'sessionmanager';
import { formatMessageWithLocale, getLongBankName } from 'i18n';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { checkOffline } from 'fpx/helper';
import { FPX_OFFLINE_BANK } from 'fpx/i18n/label';
import type { Banks } from 'razorpay/types/Preferences';
import type {
  Instrument,
  transformedBank,
  TranslatedBankType,
} from './types/bank';

// const cdnUrl = '';
const cdnUrl = RazorpayConfig.cdn;
const prefix = cdnUrl + 'bank/';
const fullPrefix = cdnUrl + 'bank-lg/';

export const getBankLogo = (code: string) => `${prefix}${code.slice(0, 4)}.gif`;
export const getFullBankLogo = (code: string) =>
  `${fullPrefix}${code.slice(0, 4)}.svg`;

export const BANK_TYPES = {
  RETAIL: 'retail',
  CORPORATE: 'corporate',
};

const _commonBanks = {
  ICIC_C: 'ICICI Corporate',
  UTIB_C: 'Axis Corporate',
  SBIN: 'SBI',
  HDFC: 'HDFC',
  ICIC: 'ICICI',
  UTIB: 'Axis',
  KKBK: 'Kotak',
  YESB: 'Yes',
  IBKL: 'IDBI',
  BARB_R: 'BOB',
  PUNB_R: 'PNB',
  IOBA: 'IOB',
  FDRL: 'Federal',
  CORP: 'Corporate',
  IDFB: 'IDFC',
  INDB: 'IndusInd',
  VIJB: 'Vijaya Bank',
  BARB: 'BOB',
  RATN: 'RBL',
};

/**
 * Returns the name of the common bank
 * @param {string} code
 *
 * @returns {string}
 */
export function getCommonBankName(code: keyof typeof _commonBanks) {
  if (_commonBanks[code]) {
    return _commonBanks[code];
  }

  return code;
}

/**
 * Transforms a banks object to a list with name, code and logo
 * @param {Partial<Banks>} bankObj
 * @return {transformedBank[]}
 */
const transformBanks = (bankObj: Partial<Banks>): transformedBank[] =>
  Object.entries(bankObj).map((entry) => ({
    name: entry[1] || '',
    code: entry[0],
    logo: getBankLogo(entry[0]),
  }));

export const commonBanks = transformBanks(_commonBanks);

export const emiBanks = [
  {
    code: 'KKBK',
    name: 'Kotak Mahindra Bank',
  },
  {
    code: 'KKBK_DC',
    name: 'Kotak Debit Cards',
  },
  {
    code: 'HDFC_DC',
    name: 'HDFC Debit Cards',
  },
  {
    code: 'HDFC',
    name: 'HDFC Credit Cards',
  },
  {
    code: 'UTIB',
    name: 'Axis Bank',
  },
  {
    code: 'INDB',
    name: 'Indusind Bank',
  },
  {
    code: 'RATN',
    name: 'RBL Bank',
  },
  {
    code: 'ICIC',
    name: 'ICICI Bank',
  },
  {
    code: 'SCBL',
    name: 'Standard Chartered Bank',
  },
  {
    code: 'YESB',
    name: 'Yes Bank',
  },
  {
    code: 'AMEX',
    name: 'American Express',
  },
  {
    code: 'SBIN',
    name: 'State Bank of India',
  },
  {
    code: 'BARB',
    name: 'Bank of Baroda',
  },
  {
    code: 'BAJAJ',
    name: 'Bajaj Finserv',
  },
  {
    code: 'CITI',
    name: 'CITI Bank',
  },
  {
    code: 'HSBC',
    name: 'HSBC Credit Cards',
  },
  {
    code: 'FDRL',
    name: 'Federal Bank',
  },
  {
    code: 'IDFB',
    name: 'IDFC First Bank',
  },
  {
    code: 'onecard',
    name: 'OneCard',
  },
  {
    code: 'INDB_DC',
    name: 'Indusind Bank Debit Cards',
  },
];

export const DEBIT_EMI_ISSUERS = ['KKBK', 'HDFC', 'INDB'];
export const DEBIT_EMI_BANKS = DEBIT_EMI_ISSUERS.map((bank) => `${bank}_DC`);

export const getBankFromCardCache = (cardNum: string | number | string[]) => {
  const cardFeatures = getCardMetadata(cardNum);
  let issuer = cardFeatures.issuer;

  const network = cardFeatures.network;
  const cobrandingPartner = cardFeatures.cobranding_partner;

  if (!issuer && cardFeatures.network === 'amex') {
    issuer = 'AMEX';
  }

  if (cardFeatures.type === 'debit') {
    issuer += '_DC';
  }

  const bankObj = emiBanks.find((bankObj) => bankObj.code === issuer);

  if (bankObj) {
    return {
      name: bankObj.name,
      code: bankObj.code,
      logo: getBankLogo(bankObj.code),
      network,
      cobrandingPartner,
    };
  }
};

export const getPreferredBanks = (
  availBanks: Partial<Banks>,
  bankOptions: Record<string, any>
) => {
  const order = bankOptions && bankOptions.order;

  if (!availBanks) {
    return;
  }

  let bankList: Record<string, any> = commonBanks.filter(
    (currBank) =>
      availBanks[currBank.code] && !availBanks[currBank.code.slice(0, -2)]
  );
  if (_.isArray(order)) {
    const availBanksList = transformBanks(availBanks);

    /* Indexing to avoid search */
    const bankIndexMap: Record<string, any> = availBanksList.reduce(function (
      map: Record<string, transformedBank>,
      bank: transformedBank
    ) {
      map[bank.code] = bank;
      return map;
    },
    {});

    bankList = order
      /* convert strings given in order to bank object */
      .map(function (b) {
        return bankIndexMap[b];
      })

      /* add rest of the preferred banks */
      .concat(bankList)

      /* remove empty and duplicated banks */
      .filter(function (bankObj) {
        const bankVal = bankObj && bankIndexMap[bankObj.code];
        if (bankVal) {
          /* remove from index to avoid repetition */
          bankIndexMap[bankObj.code] = false;
          return bankVal;
        }
      });
  }

  return bankList;
};

/**
 * Checks whether the given bank has multiple options (Corporate, Retail)
 * @param {string} bankCode
 * @param {Partial<Banks>} banks
 */
export function hasMultipleOptions(bankCode: string, banks: Partial<Banks>) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  // Some retail banks have the suffix _R, while others don't. So we look for
  // codes both with and without the suffix.
  const hasRetail =
    banks[normalizedBankCode] || banks[normalizedBankCode + '_R'];
  const hasCorporate = banks[normalizedBankCode + '_C'];
  return hasRetail && hasCorporate;
}

/**
 * Returns the code for retail option corresponding to `bankCode`. Looks for
 * {bankCode} and {bankCode}_R in `banks`.
 * Returns false if no option is present.
 * @param {string} bankCode
 * @param {Partial<Banks>} banks
 */
export function getRetailOption(bankCode: string, banks: Partial<Banks>) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  const retailBankCode = normalizedBankCode + '_R';
  if (banks[normalizedBankCode]) {
    return normalizedBankCode;
  }
  return banks[retailBankCode] && retailBankCode;
}

/**
 * Returns the code for corporate option corresponding to `bankCode`. Looks for
 * {bankCode}_C in `banks`.
 * Returns false if no option is present.
 * @param {string} bankCode
 * @param {Partial<Banks>} banks
 */
export function getCorporateOption(bankCode: string, banks: Partial<Banks>) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  const corporateBankCode = normalizedBankCode + '_C';
  return banks[corporateBankCode] && corporateBankCode;
}

/*
 * Returns a bank code with suffixes(_C, _R) removed.
 * @param {string} bankCode
 */
export function normalizeBankCode(bankCode: string) {
  return bankCode.replace(/_[CR]$/, '');
}

/**
 * Checks if the given bank code is for corporate netbanking.
 *
 * @param {string} bankCode
 * @return {boolean}
 */
export function isCorporateCode(bankCode: string) {
  return /_C$/.test(bankCode);
}

/**
 * Checks if the given bank is debit emi issuer or not.
 *
 * @param {string} bankCode
 * @param {string} cardType
 * @return {boolean}
 */
export function isDebitEMIBank(bankCode: string, type = '') {
  // use debit card issuers list if _DC is not passed in the bank code
  const debitCardIssuers = DEBIT_EMI_ISSUERS;

  // if card type check for whether type is debit and card belongs to EMI issuers
  if (type) {
    if (type === 'debit' && debitCardIssuers.includes(bankCode)) {
      return true;
    }
  } else if (debitCardIssuers.includes(bankCode)) {
    return true;
  }
  return false;
}

// Checks if the selected bank code is eligible for DC EMI
export function isDebitIssuer(bankCode: string) {
  return DEBIT_EMI_BANKS.includes(bankCode);
}

/**
 * Filters banks against the given instrument.
 * Only allows those banks that match the given instruments.
 *
 * @param {Partial<Banks>} banks
 * @param {Instrument} instrument
 *
 * @returns {Partial<Banks>}
 */
export function filterBanksAgainstInstrument(
  banks: Partial<Banks>,
  instrument: Instrument,
  method: string
) {
  if (!instrument || instrument.method !== method) {
    return banks;
  }

  if (!instrument.banks) {
    return banks;
  }

  const filteredBanks: Partial<Banks> = {};

  instrument.banks.forEach((code: string) => {
    if (banks[code]) {
      filteredBanks[code] = banks[code];
    }
  });

  return filteredBanks;
}

/**
 * filters out hidden banks from bank list
 * @param {object} banks
 * @param {array} hiddenBanks
 * @returns {Partial<Banks>}
 */
export function filterHiddenBanksUsingConfig(
  banks: Partial<Banks>,
  hiddenBanks: string[]
) {
  banks = ObjectUtils.clone(banks);
  hiddenBanks?.forEach((hiddenBank) => {
    delete banks[hiddenBank];
  });

  return banks;
}

/**
 * @param {{
 *  banks: Banks;
 *  method: string;
 *  instrument: Instrument;
 *  hiddenBanks: array;
 * }}
 * @returns {{
 *  bankList: Partial<Banks>;
 *  corporateBanks: Partial<Banks>;
 *  retailBanks: Partial<Banks>;
 * }}
 */
export function computeBankData({
  banks,
  method,
  instrument,
  hiddenBanks,
}: {
  banks: Partial<Banks>;
  method: string;
  instrument: Instrument;
  hiddenBanks: string[];
}) {
  let bankList = banks;
  // filter with the banks in selected instrument (for eg, user selects customized block with HSBC and CITI banks)
  bankList = filterBanksAgainstInstrument(banks, instrument, method);

  // remove hidden banks passed in the config
  bankList = filterHiddenBanksUsingConfig(bankList, hiddenBanks);

  let retailBanks = {};
  let corporateBanks = {};

  // avoid extra computation as it's only needed for FPX
  if (method === 'fpx') {
    retailBanks = filterBanksByType(bankList, BANK_TYPES.RETAIL);
    corporateBanks = filterBanksByType(bankList, BANK_TYPES.CORPORATE);
  }

  return { bankList, retailBanks, corporateBanks };
}

/**
 * return list of banks based on type received
 * @param {Partial<Banks>} banks: list of banks
 * @param {string} type: retail/corporate
 * @returns {Partial<Banks>}
 */
export function filterBanksByType(banks: Partial<Banks>, type: string) {
  const bankList: Partial<Banks> = {};
  Object.keys(banks).forEach((bankCode) => {
    if (
      (type === BANK_TYPES.CORPORATE && isCorporateCode(bankCode)) ||
      (type === BANK_TYPES.RETAIL && !isCorporateCode(bankCode))
    ) {
      bankList[bankCode] = banks[bankCode];
    }
  });

  return bankList;
}

/**
 * Handle when the user presses Enter while focused
 * on button#bank-select
 */
export function handleEnterOnBanking(event: KeyboardEvent) {
  // 13 = Enter
  if (_.getKeyFromEvent(event) === 13) {
    event.preventDefault();

    getSession().preSubmit();
  }
}

/**
 * return translated Array of banks for Search dropdown menu
 * @param {Partial<Banks>} banks list of banks
 * @param {boolean} isFpx is method FPX or not
 * @returns {array}
 */
export function computeTranslatedBanks(banks: Partial<Banks>, isFpx = false) {
  return Object.entries(banks).map((entry) => {
    const code = entry[0];
    const name = entry[1] || '';
    const translatedBank: TranslatedBankType = {
      code: code,
      original: name,
      name: getLongBankName(code, get(locale) as string, name),
      _key: code,
    };
    if (isFpx) {
      translatedBank.disabledText = checkOffline(code)
        ? formatMessageWithLocale(FPX_OFFLINE_BANK, get(locale) as string)
        : '';
      translatedBank.logoCode = normalizeBankCode(code);
    }

    return translatedBank;
  });
}
