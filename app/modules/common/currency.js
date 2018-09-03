export const currencies = {
  INR: '₹',
  USD: '$',
};

export const displayCurrencies = {
  AFN: '&#x60b;',
  ALL: '&#x6b;',
  DZD: 'د.ج',
  WST: 'T',
  EUR: '&#8364;',
  AOA: 'Kz',
  XCD: 'EC$',
  ARS: '$',
  AMD: '&#1423;',
  AWG: 'ƒ',
  AUD: 'A$',
  AZN: 'ман',
  BSD: 'B$',
  BHD: 'د.ب',
  BDT: '&#x9f3;',
  BBD: 'Bds$',
  BYR: 'Br',
  BZD: 'BZ$',
  XOF: 'CFA',
  BMD: 'BD$',
  BTN: 'Nu.',
  BOB: 'Bs.',
  BAM: 'KM',
  BWP: 'P',
  BRL: 'R$',
  USD: '$',
  BND: 'B$',
  BGN: 'лв',
  BIF: 'FBu',
  KHR: '៛',
  XAF: 'CFA',
  CAD: 'C$',
  CVE: 'Esc',
  KYD: 'KY$',
  CLP: '$',
  CNY: '&#165;',
  COP: '$',
  KMF: 'CF',
  NZD: 'NZ$',
  CRC: '&#x20a1;',
  HRK: 'Kn',
  CUC: '&#x20b1;',
  ANG: 'ƒ',
  CZK: 'Kč',
  CDF: 'FC',
  DKK: 'Kr.',
  DJF: 'Fdj',
  DOP: 'RD$',
  EGP: 'E&#163;',
  SVC: '&#x20a1;',
  ERN: 'Nfa',
  ETB: 'Br',
  FKP: 'FK&#163;',
  FJD: 'FJ$',
  XPF: 'F',
  GMD: 'D',
  GEL: 'ლ',
  GHS: '&#x20b5;',
  GIP: '&#163;',
  GTQ: 'Q',
  GBP: '&#163;',
  GNF: 'FG',
  GYD: 'GY$',
  HTG: 'G',
  HNL: 'L',
  HKD: 'HK$',
  HUF: 'Ft',
  ISK: 'Kr',
  IDR: 'Rp',
  IRR: '&#xfdfc;',
  IQD: 'ع.د',
  ILS: '&#x20aa;',
  JMD: 'J$',
  JPY: '&#165;',
  JOD: 'د.ا',
  KZT: '&#x20b8;',
  KES: 'KSh',
  KWD: 'د.ك',
  KGS: 'лв',
  LAK: '&#x20ad;',
  LVL: 'Ls',
  LBP: 'L&#163;',
  LSL: 'L',
  LRD: 'L$',
  LD: 'ل.د',
  LYD: 'ل.د',
  CHF: 'Fr',
  LTL: 'Lt',
  MOP: 'P',
  MKD: 'ден',
  MGA: 'Ar',
  MWK: 'MK',
  MYR: 'RM',
  MVR: 'Rf',
  MRO: 'UM',
  MUR: 'Ɍs',
  MXN: '$',
  MDL: 'L',
  MNT: '&#x20ae;',
  MAD: 'د.م.',
  MZN: 'MT',
  MMK: 'K',
  NAD: 'N$',
  NPR: 'NɌs',
  NIO: 'C$',
  NGN: '&#x20a6;',
  KPW: '₩',
  NOK: 'Kr',
  OMR: 'ر.ع.',
  PKR: 'Ɍs',
  PAB: 'B/.',
  PGK: 'K',
  PYG: '&#x20b2;',
  PEN: 'S/.',
  PHP: '&#x20b1;',
  PLN: 'Zł',
  QAR: 'QAR',
  RON: 'L',
  RUB: 'руб',
  RWF: 'RF',
  SHP: '&#163;',
  STD: 'Db',
  SAR: 'ر.س',
  RSD: 'Дин.',
  SCR: 'Ɍs',
  SLL: 'Le',
  SGD: 'S$',
  SBD: 'SI$',
  SOS: 'So. Sh.',
  ZAR: 'R',
  KRW: '₩',
  SDG: '&#163;Sd',
  LKR: 'Rs',
  SFR: 'Fr',
  SRD: '$',
  SZL: 'L',
  SEK: 'Kr',
  SYP: 'S&#163;',
  TWD: 'NT$',
  TJS: 'SM',
  TZS: 'TSh',
  THB: '&#x0e3f;',
  TOP: 'T$',
  TTD: 'TT$',
  TND: 'د.ت',
  TRY: 'TL',
  TMT: 'M',
  UGX: 'USh',
  UAH: '&#x20b4;',
  AED: 'د.إ',
  UYU: '$U',
  UZS: 'лв',
  VUV: 'VT',
  VEF: 'Bs',
  VND: '&#x20ab;',
  YER: '&#xfdfc;',
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

export function displayAmount(razorpay) {
  let get = razorpay.get;
  let displayCurrency = get('display_currency');
  if (displayCurrency) {
    return formatNumber(get('display_amount'), displayCurrency);
  }
  return formatAmount(
    razorpay.display_amount || get('amount'),
    get('currency')
  );
}

export const getDecimalAmount = amount =>
  (amount / 100).toFixed(2).replace('.00', '');
