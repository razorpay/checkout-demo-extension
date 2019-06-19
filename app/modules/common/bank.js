import { RazorpayConfig } from 'common/Razorpay';

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
    patt: /^4(62409|04861|78006|34668|1(4767|664[3-6])|363(88|89|90))|5(24253|43705|47981)/,
  },
  {
    code: 'HDFC',
    name: 'HDFC Bank',
    patt: /^((5(5(2(3(8[59]|[49]4|65)|2(60|74)|088)|3583|6042|9300)|2(4((1[18]|93)1|216|368)|2852|8945)|3(21(18|35)|3744|6311)|45(226|964)|176(35|52))|4(3(6(152|306|520)|467[78]|7546)|6((247|391)7|178[67])|1(6317|7410|8136)|8(549[89]|9377)|0(1403|5028)|5(11|77)04)|36(08(2[56]|8[67])|1011|7123|8357)))/,
  },
  {
    code: 'UTIB',
    name: 'Axis Bank',
    patt: /^4((07438|05995|50506|64118|71864|6111[678]|71863|51457|3083[2-4])00|074390[03]|111460[0-6]|182120[12]|365600[01]|514560[04]|7186(00[013]|10[012]|30[12]))|5(24((178|240|508|512)00|1781[01])|5934([12]00|00[01])|305620[0245])/,
  },
  {
    code: 'INDB',
    name: 'Indusind Bank',
    patt: /^((4(4128(5(4[023456789]|9[012567]|0[02345]|8[012]|3[01]|6[01]|[12]0|5|7)|4(1[01]|00)|300)|(((0771|5539)2|6(3787|8936)|98726)0|27124[014]|70035[02])0|147(52(1[023]|[024]0|3[02])|72[01]0))|5(2(4480([345]0|2[01]|1)|6861(0[012]|10)|9243[05]0)|37652([15]0|75)|160680[012])|377151(0[012345678]|2[01234567]|8[0123]|7[02]|60|92)))/,
  },
  {
    code: 'RATN',
    name: 'RBL Bank',
    patt: /^5(23(6|9)50|25611|36301|36907|24373|28028|31845|41538|42505|49489)/,
  },
  {
    code: 'ICIC',
    name: 'ICICI Bank',
    patt: /^((4(0(7(65[19]|352)|2(368|853)|5533)|4(77(4[67]|58)|4341)|2(322[67]|0580)|6(1133|2986)|7(0573|4846)|3(158|755)1|5(017|545)2|10059|86630)|5(2(4(193|376)|3951|5996)|4((520|746)7|0282)|17(6(37|53)|719)|52418)|37(47|70)41))/,
  },
  {
    code: 'SCBL',
    name: 'Standard Chartered Bank',
    patt: /^4(02874|1(290[345]|9607)|29344|5(4198|6398|7036)|622(69|7[0-3])|9407[67])|5(2(3990|9388)|4(0(46[01]|711)|3186|4438|7359|9(1(24|32)))|5(3160|437[458]|4623|8959))/,
  },
  {
    code: 'YESB',
    name: 'Yes Bank',
    patt: /^5(3(1849|6303)|24167|49921|58918)/,
  },
  {
    code: 'AMEX',
    name: 'American Express',
    patt: /^(37(9(8(6[123789]|7[012678])|397)|693))/,
  },
  {
    code: 'SBIN',
    name: 'State Bank of India',
    patt: /^((4(0((474|969)5|3(009|250)|066[67])|3(1(75[47]|459)|358[78]|7748|8105)|6(874[23]|0214|1119)|5(257[24]|9247)|20739|72642)|5(1(0(1(28|35)|223)|(262|725)2)|2(4((24|31)7|182)|6468|8734)|36298|47359)))/,
  },
  {
    code: 'BARB',
    name: 'Bank of Baroda',
    patt: /^(4(6(249[01]|8943)|(4237|7263)8)|5(3(2000|4{4})|48245))/,
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

export const getPreferredBanks = (preferences, bankOptions) => {
  const availBanks = preferences.methods.netbanking;
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
