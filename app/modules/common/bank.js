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
    patt: /^36(08(25|26|86|87)|1011|7123|8357)|4(05028|16317|17410|18136|3467[78]|36(152|306|520)|37546|5(11|77)04|6178[67]|6(247|391)7|8549[89]|89377)|5(176(35|52)|2(2852|4(1[18]1|216|368|931)|8945)|3(2118|2135|3744|6311)|45226|45964|5(2(088|260|274|3(44|65|85|89|94))|3583|6042|9300))/,
  },
  {
    code: 'UTIB',
    name: 'Axis Bank',
    patt: /^4((07438|05995|50506|64118|71864|6111[678]|71863|51457|3083[2-4])00|074390[03]|111460[0-6]|182120[12]|365600[01]|514560[04]|7186(00[013]|10[012]|30[12]))|5(24((178|240|508|512)00|1781[01])|5934([12]00|00[01])|305620[0245])/,
  },
  {
    code: 'INDB',
    name: 'Indusind Bank',
    patt: /^377151|5(3765210|26861(0[0-2]|10)|24480([1-4]0|11|12)|160680[0-2])|4((63787|68936|98726)00|14752((0|1|2)0|1(2|3))|27124(0|1)0|4128(300|400|410|411|5(\d0|02|03|([3,6-8])1|7[5-8]|95)))/,
  },
  {
    code: 'RATN',
    name: 'RBL Bank',
    patt: /^5(23(6|9)50|25611|36301|36907|24373|28028|31845|41538|42505|49489)/,
  },
  {
    code: 'ICIC',
    name: 'ICICI Bank',
    patt: /^4(37551|50172|61133|62986|70573|74846|0(2368|5533|7(352|65(1|9)))|2322(6|7)|20580|477(46|47|58)|44341)|5(17(637|653|719)|24(193|376)|(23951|25996|52418|47467|45207|40282))|37(474(0|1|2[0-9])|6944[0-1,3-9]|704(1|0[2-4]))/,
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
    patt: /^37(693|9397|98(6[1-3,7-9]|7[0-2,6-8]))/,
  },
  {
    code: 'SBIN',
    name: 'State Bank of India',
    patt: /^((4(0((474|969)5|3(009|250)|066[67])|3(1(75[47]|459)|358[78]|7748|8105)|6(874[23]|0214|1119)|5(257[24]|9247)|20739|72642)|5(1(0(1(28|35)|223)|(262|725)2)|2(4((24|31)7|182)|6468|8734)|36298|47359)))/
  }
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

export const getDownBanks = preferences => {
  const downtime = preferences.downtime;
  let downList = [];

  if (downtime) {
    downList = _Arr.map(downtime.netbanking || [], o => o.issuer);
  }
  return downList;
};
