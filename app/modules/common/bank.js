import RazorpayConfig from 'common/RazorpayConfig';

// const cdnUrl = '';
const cdnUrl = RazorpayConfig.cdn;
const prefix = cdnUrl + 'bank/';
const fullPrefix = cdnUrl + 'bank-lg/';

export const getBankLogo = code => `${prefix}${code.slice(0, 4)}.gif`;
export const getFullBankLogo = code => `${fullPrefix}${code.slice(0, 4)}.svg`;

const _commonBanks = [
  ['ICIC_C', 'ICICI Corporate'],
  ['UTIB_C', 'Axis Corporate'],
  ['SBIN', 'SBI'],
  ['HDFC', 'HDFC'],
  ['ICIC', 'ICICI'],
  ['UTIB', 'Axis'],
  ['KKBK', 'Kotak'],
  ['YESB', 'Yes'],
  ['IBKL', 'IDBI'],
  ['BARB_R', 'BOB'],
  ['PUNB_R', 'PNB'],
  ['IOBA', 'IOB'],
  ['FDRL', 'Federal'],
  ['CORP', 'Corporate'],
  ['IDFB', 'IDFC'],
  ['INDB', 'IndusInd'],
  ['VIJB', 'Vijaya Bank'],
];

export const commonBanks = _Arr.map(_commonBanks, banks => ({
  name: banks[1],
  code: banks[0],
  logo: getBankLogo(banks[0]),
}));

export const emiBanks = [
  {
    code: 'KKBK',
    name: 'Kotak Mahindra Bank',
    patt: /^((4(3(63(8[89]|90)|466[89])|1(664[3456]|4767)|04861|62409|78006)|5(4(3705|7981)|24253)))/,
  },
  {
    code: 'HDFC',
    name: 'HDFC Bank',
    patt: /^((5(5(2(3(8[59]|[49]4|65)|2(60|74)|088)|3(162|374|583)|6(042|620)|8(818|983)|5153|9300)|2(4((1[18]|93)1|216|368)|(894|918)5|2852)|3(2(1(18|35)|9(61|73))|3744|6311|7206)|4(5(226|964)|0536)|1(76(35|52)|8159))|4(3(4(1(55|68)|67[78])|6(152|306|520)|(537|754)6|0570)|8(9(37[67]|519)|549[89]|1508|6575|8994)|6(391[789]|178[67]|774[12]|2477)|5(7(262|704)|1104)|1(6317|7410|8136)|0(1403|5028)|7(1865|8024)|21578)|36(0(8(2[56789]|8[67])|966)|1(01[01]|135)|7123|8357|9620)|222703|652850))/,
  },
  {
    code: 'UTIB',
    name: 'Axis Bank',
    patt: /^((4(7186(00[0123]|10[012]|30[012])|1(11460[01234567]|82120[12])|3(083[234]00|65600[01])|6(111[678]00|41180[01])|5145(60[04]|70[01])|0(599500|743903)|9090600)|5(2(4((5(08|12)|240)00|178(1[01]|00))|962900)|5934(00[01]|20[02]|100)|3(05620[0245678]|3467[0-9][0-9]))))/,
  },
  {
    code: 'INDB',
    name: 'Indusind Bank',
    patt: /^((4(4128(5(4[023456789]|9[0125678]|0[023456]|8[012]|3[01]|6[01]|[12]0|5|7)|4(1[01]|00)|300)|(7(0035[02]|80080)|9(08191|87260)|6(3787|8936)0|27124[014]|07712[05])0|147(52(1[023]|[027]0|3[02]|4[01])|72[01]0))|5(2(4480(2[014]|5[01]|[34]0|1)|6861(0[012]|10)|9243[05]0)|37652([15]0|75)|160680[012])|377151(2[01234567]|8[0123]|7[02]|9[12]|0|60)))/,
  },
  {
    code: 'RATN',
    name: 'RBL Bank',
    patt: /^(5(2(3[69]50|4373|5611|8028)|3(6(301|907)|1845)|4(1538|2505|9489)))/,
  },
  {
    code: 'ICIC',
    name: 'ICICI Bank',
    patt: /^((4(0(7(65[19]|352)|2(368|853)|5533)|4(77(4[67]|58)|4341)|2(322[67]|0580)|6(1133|2986)|7(0573|4846)|3(158|755)1|5(017|545)2|10059|86630)|5(2(4(193|376)|3951|5996)|4((520|746)7|0282)|17(6(37|53)|719)|52418)|37(474[012]|704[01]|6944)))/,
  },
  {
    code: 'SCBL',
    name: 'Standard Chartered Bank',
    patt: /^((5(4(0(46[01]|711)|91(24|32)|3186|4438)|5(4(37[458]|623)|3160|8959)|2(3990|9388))|4(5((41|63)98|7036)|1(290[345]|9607)|622(7[0123]|69)|(0287|2934)4|9407[67])))/,
  },
  {
    code: 'YESB',
    name: 'Yes Bank',
    patt: /^(5(3(1849|6303)|24167|49921|58918))/,
  },
  {
    code: 'AMEX',
    name: 'American Express',
    patt: /^(37(9(8(6[123789]|7[012678])|397)|693))/,
  },
  {
    code: 'SBIN',
    name: 'State Bank of India',
    patt: /^((4(0((474|969)5|3(009|250)|066[67])|3(1(75[47]|459)|358[78]|7748|8105)|5(257[24]|9247)|6(874[23]|1119)|20739|72642)|5(1(0(1(28|35)|223)|(262|725)2)|2(4((24|31)7|182)|6468|8734)|36298|47359)))/,
  },
  {
    code: 'BARB',
    name: 'Bank of Baroda',
    patt: /^((4(6(249[01]|8943)|(4237|7263)8)|5(3(2000|4{4})|48245)))/,
  },
  {
    code: 'BAJAJ',
    name: 'Bajaj Finserv',
    patt: /^203040/,
  },
];

export const getBankFromCard = cardNum => {
  let bankObj = _Arr.find(emiBanks, bankObj => bankObj.patt.test(cardNum));
  if (bankObj) {
    return {
      name: bankObj.name,
      code: bankObj.code,
      logo: getBankLogo(bankObj.code),
    };
  }
};

export const getPreferredBanks = (availBanks, bankOptions) => {
  const order = bankOptions && bankOptions.order;

  if (!availBanks) {
    return;
  }

  let bankList =
    commonBanks
    |> _Arr.filter(currBank => {
      return (
        availBanks[currBank.code] &&
        !availBanks[currBank.code |> _Str.slice(0, -2)]
      );
    });

  if (_.isArray(order)) {
    /* Indexing to avoid search */
    var bankIndexMap = bankList.reduce(function(map, bank, index) {
      map[bank.code] = bank;
      return map;
    }, {});

    bankList = order
      /* convert strings given in order to bank object */
      .map(function(b) {
        return bankIndexMap[b];
      })

      /* add rest of the preferred banks */
      .concat(bankList)

      /* remove empty and duplicated banks */
      .filter(function(bankObj) {
        var bankVal = bankObj && bankIndexMap[bankObj.code];
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
 * Returns the list of banks that have a downtime.
 * @param {Object} preferences
 *
 * @return {Array}
 */
export const getDownBanks = preferences => {
  /*
    "downtime": {
      "netbanking": [
        {
          "issuer": [
            "CIUB"
          ],
          "severity": "high",
          "begin": 1554061550
        }
      ]
    }
  */

  const downtime = preferences.downtime;
  let downList = [];

  if (downtime) {
    _Arr.loop(_Arr.map(downtime.netbanking || [], o => o.issuer), downBanks => {
      downList = downList.concat(downBanks);
    });
  }

  // TODO: Remove duplicate entries from downList

  return downList;
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
