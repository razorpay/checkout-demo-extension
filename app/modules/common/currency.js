export const currencies = {
  INR: '₹',
  USD: '$',
};

export const displayCurrencies = {
  AED: 'د.إ',
  AFN: '&#x60b;',
  ALL: '&#x6b;',
  AMD: '&#1423;',
  ANG: 'ƒ',
  AOA: 'Kz',
  ARS: '$',
  AUD: 'A$',
  AWG: 'ƒ',
  AZN: 'ман',
  BAM: 'KM',
  BBD: 'Bds$',
  BDT: '&#x9f3;',
  BGN: 'лв',
  BHD: 'د.ب',
  BIF: 'FBu',
  BMD: 'BD$',
  BND: 'B$',
  BOB: 'Bs.',
  BRL: 'R$',
  BSD: 'B$',
  BTN: 'Nu.',
  BWP: 'P',
  BYR: 'Br',
  BZD: 'BZ$',
  CAD: 'C$',
  CDF: 'FC',
  CHF: 'Fr',
  CLP: '$',
  CNY: '&#165;',
  COP: '$',
  CRC: '&#x20a1;',
  CUC: '&#x20b1;',
  CVE: 'Esc',
  CZK: 'Kč',
  DJF: 'Fdj',
  DKK: 'Kr.',
  DOP: 'RD$',
  DZD: 'د.ج',
  EGP: 'E&#163;',
  ERN: 'Nfa',
  ETB: 'Br',
  EUR: '&#8364;',
  FJD: 'FJ$',
  FKP: 'FK&#163;',
  GBP: '&#163;',
  GEL: 'ლ',
  GHS: '&#x20b5;',
  GIP: '&#163;',
  GMD: 'D',
  GNF: 'FG',
  GTQ: 'Q',
  GYD: 'GY$',
  HKD: 'HK$',
  HNL: 'L',
  HRK: 'Kn',
  HTG: 'G',
  HUF: 'Ft',
  IDR: 'Rp',
  ILS: '&#x20aa;',
  IQD: 'ع.د',
  IRR: '&#xfdfc;',
  ISK: 'Kr',
  JMD: 'J$',
  JOD: 'د.ا',
  JPY: '&#165;',
  KES: 'KSh',
  KGS: 'лв',
  KHR: '៛',
  KMF: 'CF',
  KPW: '₩',
  KRW: '₩',
  KWD: 'د.ك',
  KYD: 'KY$',
  KZT: '&#x20b8;',
  LAK: '&#x20ad;',
  LBP: 'L&#163;',
  LD: 'ل.د',
  LKR: 'Rs',
  LRD: 'L$',
  LSL: 'L',
  LTL: 'Lt',
  LVL: 'Ls',
  LYD: 'ل.د',
  MAD: 'د.م.',
  MDL: 'L',
  MGA: 'Ar',
  MKD: 'ден',
  MMK: 'K',
  MNT: '&#x20ae;',
  MOP: 'P',
  MRO: 'UM',
  MUR: 'Ɍs',
  MVR: 'Rf',
  MWK: 'MK',
  MXN: '$',
  MYR: 'RM',
  MZN: 'MT',
  NAD: 'N$',
  NGN: '&#x20a6;',
  NIO: 'C$',
  NOK: 'Kr',
  NPR: 'NɌs',
  NZD: 'NZ$',
  OMR: 'ر.ع.',
  PAB: 'B/.',
  PEN: 'S/.',
  PGK: 'K',
  PHP: '&#x20b1;',
  PKR: 'Ɍs',
  PLN: 'Zł',
  PYG: '&#x20b2;',
  QAR: 'QAR',
  RON: 'L',
  RSD: 'Дин.',
  RUB: 'руб',
  RWF: 'RF',
  SAR: 'ر.س',
  SBD: 'SI$',
  SCR: 'Ɍs',
  SDG: '&#163;Sd',
  SEK: 'Kr',
  SFR: 'Fr',
  SGD: 'S$',
  SHP: '&#163;',
  SLL: 'Le',
  SOS: 'So. Sh.',
  SRD: '$',
  STD: 'Db',
  SVC: '&#x20a1;',
  SYP: 'S&#163;',
  SZL: 'L',
  THB: '&#x0e3f;',
  TJS: 'SM',
  TMT: 'M',
  TND: 'د.ت',
  TOP: 'T$',
  TRY: 'TL',
  TTD: 'TT$',
  TWD: 'NT$',
  TZS: 'TSh',
  UAH: '&#x20b4;',
  UGX: 'USh',
  USD: '$',
  UYU: '$U',
  UZS: 'лв',
  VEF: 'Bs',
  VND: '&#x20ab;',
  VUV: 'VT',
  WST: 'T',
  XAF: 'CFA',
  XCD: 'EC$',
  XOF: 'CFA',
  XPF: 'F',
  YER: '&#xfdfc;',
  ZAR: 'R',
  ZMK: 'ZK',
  ZWL: 'Z$',
};

const getNumDecimalsOfCurrency = function(currency) {
  return currency === 'JPY' ? 0 : 2;
};

const formats = {
  INR: function(amount) {
    return String(amount)
      .replace(/(.{1,2})(?=.(..)+(\...)$)/g, '$1,')
      .replace('.00', '');
  },

  JPY: function(amount) {
    return String(amount).replace(/(.{1,3})(?=(...)+$)/g, '$1,');
  },
};

const defaultFormat = function(amount) {
  return String(amount)
    .replace(/(.{1,3})(?=(...)+(\...)$)/g, '$1,')
    .replace('.00', '');
};

const formatNumber = function(number, currency, numDecimals) {
  numDecimals =
    numDecimals === void 0 ? getNumDecimalsOfCurrency(currency) : numDecimals;

  return (
    (currencies[currency] || displayCurrencies[currency]) +
    (formats[currency] || defaultFormat)(
      numDecimals ? Number(number).toFixed(numDecimals) : number
    )
  );
};

export function formatAmount(amount, currency) {
  const numDecimals = getNumDecimalsOfCurrency(currency),
    divisor = Math.pow(10, numDecimals);

  return formatNumber(amount / divisor, currency, numDecimals);
}

export function displayAmount(razorpay, payloadAmount) {
  let get = razorpay.get;
  let displayCurrency = get('display_currency');
  if (displayCurrency) {
    return formatNumber(get('display_amount'), displayCurrency);
  }
  return formatAmount(
    razorpay.display_amount || payloadAmount || get('amount'),
    get('currency')
  );
}

export const getDecimalAmount = amount =>
  (amount / 100).toFixed(2).replace('.00', '');
