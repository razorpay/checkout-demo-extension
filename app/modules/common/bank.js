import RazorpayConfig from 'common/RazorpayConfig';
import { getCardMetadata } from 'common/card';
import * as _ from 'utils/_';

// const cdnUrl = '';
const cdnUrl = RazorpayConfig.cdn;
const prefix = cdnUrl + 'bank/';
const fullPrefix = cdnUrl + 'bank-lg/';

export const getBankLogo = (code) => `${prefix}${code.slice(0, 4)}.gif`;
export const getFullBankLogo = (code) => `${fullPrefix}${code.slice(0, 4)}.svg`;

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
export function getCommonBankName(code) {
  if (_commonBanks[code]) {
    return _commonBanks[code];
  }

  return code;
}

/**
 * Transforms a banks object to a list with name, code and logo
 * @param {Object} bankObj
 * @return {Array<{name: string, code: string, logo: string}>}
 */
const transformBanks = (bankObj) =>
  Object.entries(bankObj).map((entry) => ({
    name: entry[1],
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

export const getBankFromCardCache = (cardNum) => {
  const cardFeatures = getCardMetadata(cardNum);
  let issuer = cardFeatures.issuer;

  let network = cardFeatures.network;
  let cobrandingPartner = cardFeatures.cobranding_partner;

  if (!issuer && cardFeatures.network === 'amex') {
    issuer = 'AMEX';
  }

  if (cardFeatures.type === 'debit') {
    issuer += '_DC';
  }

  let bankObj = emiBanks.find((bankObj) => bankObj.code === issuer);

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

export const getPreferredBanks = (availBanks, bankOptions) => {
  const order = bankOptions && bankOptions.order;

  if (!availBanks) {
    return;
  }

  let bankList = commonBanks.filter(
    (currBank) =>
      availBanks[currBank.code] && !availBanks[currBank.code.slice(0, -2)]
  );
  if (_.isArray(order)) {
    const availBanksList = transformBanks(availBanks);

    /* Indexing to avoid search */
    let bankIndexMap = availBanksList.reduce(function (map, bank) {
      map[bank.code] = bank;
      return map;
    }, {});

    bankList = order
      /* convert strings given in order to bank object */
      .map(function (b) {
        return bankIndexMap[b];
      })

      /* add rest of the preferred banks */
      .concat(bankList)

      /* remove empty and duplicated banks */
      .filter(function (bankObj) {
        let bankVal = bankObj && bankIndexMap[bankObj.code];
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
 * @param bankCode
 */
export function hasMultipleOptions(bankCode, banks) {
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
 * @param {String} bankCode
 * @param {Object} banks
 */
export function getRetailOption(bankCode, banks) {
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
 * @param {String} bankCode
 * @param {Object} banks
 */
export function getCorporateOption(bankCode, banks) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  const corporateBankCode = normalizedBankCode + '_C';
  return banks[corporateBankCode] && corporateBankCode;
}

/*
 * Returns a bank code with suffixes(_C, _R) removed.
 * @param {String} bankCode
 */
export function normalizeBankCode(bankCode) {
  return bankCode.replace(/_[CR]$/, '');
}

/**
 * Checks if the given bank code is for corporate netbanking.
 *
 * @param bankCode
 * @return {boolean}
 */
export function isCorporateCode(bankCode) {
  return /_C$/.test(bankCode);
}

/**
 * Checks if the given bank is debit emi issuer or not.
 *
 * @param {String} bankCode
 * @param {String} cardType
 * @return {boolean}
 */
export function isDebitEMIBank(bankCode, type = '') {
  // use debit card issuers list if _DC is not passed in the bank code
  let debitCardIssuers = DEBIT_EMI_ISSUERS;

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
export function isDebitIssuer(bankCode) {
  return DEBIT_EMI_BANKS.includes(bankCode);
}
