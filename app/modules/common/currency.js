/*
 * REMOVE THIS IMPORT STATEMENT AFTER INTEGRATING API
 * Using hard-coded list of currencies for min_value
 */
import currenciesList from './currenciesList';

/**
 * Remove decimals from the amount if decimals are zeroes.
 * @param {String} decimals Number of decimal digits
 * @param {String} separator Decimal point
 *
 * @return {Function}
 *  @param {String} amont Amount with decimals
 *
 *  @return {String}
 */
const removeDecimals = (decimals, separator = '.') => amount => {
  let str = separator;

  for (let i = 0; i < decimals; i++) {
    str += '0';
  }

  return amount.replace(str, '');
};

/**
 * Replace dot with comma.
 * Useful for making currencies which use comma
 * as the decimal point.
 * @param {String} str
 *
 * @return {String}
 */
const makeDecimalComma = (str, comma = ',') => str.replace(/\./, comma);

/**
 * Reference: https://www.thefinancials.com/Default.aspx?SubSectionID=curformat
 */
const CURRENCY_FORMATTERS = {
  // #,###.##
  three: (amount, decimals) =>
    String(amount).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\..{${decimals}})$)`, 'g'),
      '$1,'
    ) |> removeDecimals(decimals),

  // #.###,##
  threecommadecimal: (amount, decimals) =>
    makeDecimalComma(String(amount)).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\,.{${decimals}})$)`, 'g'),
      '$1.'
    ) |> removeDecimals(decimals, ','),

  // # ###.##
  threespaceseparator: (amount, decimals) =>
    String(amount).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\..{${decimals}})$)`, 'g'),
      '$1 '
    ) |> removeDecimals(decimals),

  // # ###,##
  threespacecommadecimal: (amount, decimals) =>
    makeDecimalComma(String(amount)).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\,.{${decimals}})$)`, 'g'),
      '$1 '
    ) |> removeDecimals(decimals, ','),

  // #, ###.##
  szl: (amount, decimals) =>
    String(amount).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\..{${decimals}})$)`, 'g'),
      '$1, '
    ) |> removeDecimals(decimals),

  // #'###.##
  chf: (amount, decimals) =>
    String(amount).replace(
      new RegExp(`(.{1,3})(?=(...)+(\\..{${decimals}})$)`, 'g'),
      "$1'"
    ) |> removeDecimals(decimals),

  // 	#,##,###.##
  inr: (amount, decimals) =>
    String(amount).replace(
      new RegExp(`(.{1,2})(?=.(..)+(\\..{${decimals}})$)`, 'g'),
      '$1,'
    ) |> removeDecimals(decimals),

  none: amount => String(amount),
};

/**
 * Config for currencies.
 *
 * "default" contains the default properties for each
 * supported currency.
 * Each currencies properties are the ones that
 * need to be overridden.
 */
const currenciesConfig = {
  default: {
    decimals: 2,
    format: CURRENCY_FORMATTERS.three,
    minimum: 100,
  },

  AED: {
    minor: 'fil',
    minimum: 10,
  },

  AFN: {
    minor: 'pul',
  },

  ALL: {
    minor: 'qindarka',
    minimum: 221,
  },

  AMD: {
    minor: 'luma',
    minimum: 975,
  },

  ANG: {
    minor: 'cent',
  },

  AOA: {
    minor: 'lwei',
  },

  ARS: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centavo',
    minimum: 80,
  },

  AUD: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minimum: 50,
    minor: 'cent',
  },

  AWG: {
    minor: 'cent',
    minimum: 10,
  },

  AZN: {
    minor: 'qäpik',
  },

  BAM: {
    minor: 'fenning',
  },

  BBD: {
    minor: 'cent',
    minimum: 10,
  },

  BDT: {
    minor: 'paisa',
    minimum: 168,
  },

  BGN: {
    minor: 'stotinki',
  },

  BHD: {
    decimals: 3,
    minor: 'fils',
  },

  BIF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  BMD: {
    minor: 'cent',
    minimum: 10,
  },

  BND: {
    minor: 'sen',
    minimum: 10,
  },

  BOB: {
    minor: 'centavo',
    minimum: 14,
  },

  BRL: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minimum: 50,
    minor: 'centavo',
  },

  BSD: {
    minor: 'cent',
    minimum: 10,
  },

  BTN: {
    minor: 'chetrum',
  },

  BWP: {
    minor: 'thebe',
    minimum: 22,
  },

  BYR: {
    decimals: 0,
    major: 'ruble',
  },

  BZD: {
    minor: 'cent',
    minimum: 10,
  },

  CAD: {
    minimum: 50,
    minor: 'cent',
  },

  CDF: {
    minor: 'centime',
  },

  CHF: {
    format: CURRENCY_FORMATTERS.chf,
    minimum: 50,
    minor: 'rappen',
  },

  CLP: {
    decimals: 0,
    format: CURRENCY_FORMATTERS.none,
    major: 'peso',
    minor: 'centavo',
  },

  CNY: {
    minor: 'jiao',
    minimum: 14,
  },

  COP: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centavo',
    minimum: 1000,
  },

  CRC: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centimo',
    minimum: 1000,
  },

  CUC: {
    minor: 'centavo',
  },

  CUP: {
    minor: 'centavo',
    minimum: 53,
  },

  CVE: {
    minor: 'centavo',
  },

  CZK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'haler',
    minimum: 46,
  },

  DJF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  DKK: {
    minimum: 250,
    minor: 'øre',
  },

  DOP: {
    minor: 'centavo',
    minimum: 102,
  },

  DZD: {
    minor: 'centime',
    minimum: 239,
  },

  EGP: {
    minor: 'piaster',
    minimum: 35,
  },

  ERN: {
    minor: 'cent',
  },

  ETB: {
    minor: 'cent',
    minimum: 57,
  },

  EUR: {
    minimum: 50,
    minor: 'cent',
  },

  FJD: {
    minor: 'cent',
    minimum: 10,
  },

  FKP: {
    minor: 'pence',
  },

  GBP: {
    minimum: 30,
    minor: 'pence',
  },

  GEL: {
    minor: 'tetri',
  },

  GIP: {
    minor: 'pence',
    minimum: 10,
  },

  GMD: {
    minor: 'butut',
  },

  GTQ: {
    minor: 'centavo',
    minimum: 16,
  },

  GYD: {
    minor: 'cent',
    minimum: 418,
  },

  HKD: {
    minimum: 400,
    minor: 'cent',
  },

  HNL: {
    minor: 'centavo',
    minimum: 49,
  },

  HRK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'lipa',
    minimum: 14,
  },

  HTG: {
    minor: 'centime',
    minimum: 167,
  },

  HUF: {
    decimals: 0,
    format: CURRENCY_FORMATTERS.none,
    major: 'forint',
    minimum: 555,
  },

  IDR: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'sen',
    minimum: 1000,
  },

  ILS: {
    minor: 'agorot',
    minimum: 10,
  },

  INR: {
    format: CURRENCY_FORMATTERS.inr,
    minor: 'paise',
  },

  IQD: {
    decimals: 3,
    minor: 'fil',
  },

  IRR: {
    minor: 'rials',
  },

  ISK: {
    decimals: 0,
    format: CURRENCY_FORMATTERS.none,
    major: 'króna',
    minor: 'aurar',
  },

  JMD: {
    minor: 'cent',
    minimum: 250,
  },

  JOD: {
    decimals: 3,
    minor: 'fil',
  },

  JPY: {
    decimals: 0,
    minimum: 50,
    minor: 'sen',
  },

  KES: {
    minor: 'cent',
    minimum: 201,
  },

  KGS: {
    minor: 'tyyn',
    minimum: 140,
  },

  KHR: {
    minor: 'sen',
    minimum: 1000,
  },

  KMF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  KPW: {
    minor: 'chon',
  },

  KRW: {
    decimals: 0,
    major: 'won',
    minor: 'chon',
  },

  KWD: {
    decimals: 3,
    minor: 'fil',
  },

  KYD: {
    minor: 'cent',
    minimum: 10,
  },

  KZT: {
    minor: 'tiyn',
    minimum: 759,
  },

  LAK: {
    minor: 'at',
    minimum: 1000,
  },

  LBP: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minor: 'piastre',
    minimum: 1000,
  },

  LKR: {
    minor: 'cent',
    minimum: 358,
  },

  LRD: {
    minor: 'cent',
    minimum: 325,
  },

  LSL: {
    minor: 'lisente',
    minimum: 29,
  },

  LTL: {
    format: CURRENCY_FORMATTERS.threespacecommadecimal,
    minor: 'centu',
  },

  LVL: {
    minor: 'santim',
  },

  LYD: {
    decimals: 3,
    minor: 'dirham',
  },

  MAD: {
    minor: 'centime',
    minimum: 20,
  },

  MDL: {
    minor: 'ban',
    minimum: 35,
  },

  MGA: {
    decimals: 0,
    major: 'ariary',
  },

  MKD: {
    minor: 'deni',
  },

  MMK: {
    minor: 'pya',
    minimum: 1000,
  },

  MNT: {
    minor: 'mongo',
    minimum: 1000,
  },

  MOP: {
    minor: 'avo',
    minimum: 17,
  },

  MRO: {
    minor: 'khoum',
  },

  MUR: {
    minor: 'cent',
    minimum: 70,
  },

  MVR: {
    minor: 'lari',
    minimum: 31,
  },

  MWK: {
    minor: 'tambala',
    minimum: 1000,
  },

  MXN: {
    minor: 'centavo',
    minimum: 39,
  },

  MYR: {
    minor: 'sen',
    minimum: 10,
  },

  MZN: {
    decimals: 0,
    major: 'metical',
  },

  NAD: {
    minor: 'cent',
    minimum: 29,
  },

  NGN: {
    minor: 'kobo',
    minimum: 723,
  },

  NIO: {
    minor: 'centavo',
    minimum: 66,
  },

  NOK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minimum: 300,
    minor: 'øre',
  },

  NPR: {
    minor: 'paise',
    minimum: 221,
  },

  NZD: {
    minimum: 50,
    minor: 'cent',
  },

  OMR: {
    minor: 'baiza',
    decimals: 3,
  },

  PAB: {
    minor: 'centesimo',
  },

  PEN: {
    minor: 'centimo',
    minimum: 10,
  },

  PGK: {
    minor: 'toea',
    minimum: 10,
  },

  PHP: {
    minor: 'centavo',
    minimum: 106,
  },

  PKR: {
    minor: 'paisa',
    minimum: 227,
  },

  PLN: {
    format: CURRENCY_FORMATTERS.threespacecommadecimal,
    minor: 'grosz',
  },

  PYG: {
    decimals: 0,
    major: 'guarani',
    minor: 'centimo',
  },

  QAR: {
    minor: 'dirham',
    minimum: 10,
  },

  RON: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'bani',
  },

  RUB: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'kopeck',
    minimum: 130,
  },

  RWF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  SAR: {
    minor: 'halalat',
    minimum: 10,
  },

  SBD: {
    minor: 'cent',
  },

  SCR: {
    minor: 'cent',
    minimum: 28,
  },

  SEK: {
    format: CURRENCY_FORMATTERS.threespacecommadecimal,
    minimum: 300,
    minor: 'öre',
  },

  SGD: {
    minimum: 50,
    minor: 'cent',
  },

  SHP: {
    minor: 'new pence',
  },

  SLL: {
    minor: 'cent',
    minimum: 1000,
  },

  SOS: {
    minor: 'centesimi',
    minimum: 1000,
  },

  SRD: {
    minor: 'cent',
  },

  STD: {
    minor: 'centimo',
  },

  SSP: {
    minor: 'piaster',
  },

  SVC: {
    minor: 'centavo',
    minimum: 18,
  },

  SYP: {
    minor: 'piaster',
  },

  SZL: {
    format: CURRENCY_FORMATTERS.szl,
    minor: 'cent',
    minimum: 29,
  },

  THB: {
    minor: 'satang',
    minimum: 64,
  },

  TJS: {
    minor: 'diram',
  },

  TMT: {
    minor: 'tenga',
  },

  TND: {
    decimals: 3,
    minor: 'millime',
  },

  TOP: {
    minor: 'seniti',
  },

  TRY: {
    minor: 'kurus',
  },

  TTD: {
    minor: 'cent',
    minimum: 14,
  },

  TWD: {
    minor: 'cent',
  },

  TZS: {
    minor: 'cent',
    minimum: 1000,
  },

  UAH: {
    format: CURRENCY_FORMATTERS.threespacecommadecimal,
    minor: 'kopiyka',
  },

  UGX: {
    minor: 'cent',
  },

  USD: {
    minimum: 50,
    minor: 'cent',
  },

  UYU: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centé',
    minimum: 67,
  },

  UZS: {
    minor: 'tiyin',
    minimum: 1000,
  },

  VND: {
    format: CURRENCY_FORMATTERS.none,
    minor: 'hao,xu',
  },

  VUV: {
    decimals: 0,
    major: 'vatu',
    minor: 'centime',
  },

  WST: {
    minor: 'sene',
  },

  XAF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  XCD: {
    minor: 'cent',
  },

  XPF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  YER: {
    minor: 'fil',
    minimum: 501,
  },

  ZAR: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minor: 'cent',
    minimum: 29,
  },

  ZMK: {
    minor: 'ngwee',
  },
};
/**
 * @param {String} currency
 * @return {Object} config
 */
export const getCurrencyConfig = currency =>
  currenciesConfig[currency]
    ? currenciesConfig[currency]
    : currenciesConfig.default;

export const supportedCurrencies = [
  'AED',
  'ALL',
  'AMD',
  'ARS',
  'AUD',
  'AWG',
  'BBD',
  'BDT',
  'BMD',
  'BND',
  'BOB',
  'BSD',
  'BWP',
  'BZD',
  'CAD',
  'CHF',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CZK',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ETB',
  'EUR',
  'FJD',
  'GBP',
  'GIP',
  'GMD',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HRK',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'JMD',
  'KES',
  'KGS',
  'KHR',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'MAD',
  'MDL',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'QAR',
  'RUB',
  'SAR',
  'SCR',
  'SEK',
  'SGD',
  'SLL',
  'SOS',
  'SSP',
  'SVC',
  'SZL',
  'THB',
  'TTD',
  'TZS',
  'USD',
  'UYU',
  'UZS',
  'YER',
  'ZAR',
];

export const displayCurrencies = {
  AED: 'د.إ',
  AFN: '&#x60b;',
  ALL: 'Lek',
  AMD: '֏',
  ANG: 'ƒ',
  AOA: 'Kz',
  ARS: '$',
  AUD: '$',
  AWG: 'ƒ',
  AZN: 'ман',
  BAM: 'KM',
  BBD: '$',
  BDT: '৳',
  BGN: 'лв',
  BHD: 'د.ب',
  BIF: 'FBu',
  BMD: '$',
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
  CHF: 'F',
  CLP: '$',
  CNY: '¥',
  COP: '$',
  CRC: '₡',
  CUC: '&#x20b1;',
  CUP: '$',
  CVE: 'Esc',
  CZK: 'Kč',
  DJF: 'Fdj',
  DKK: 'kr',
  DOP: '$',
  DZD: 'د.ج',
  EGP: '£',
  ERN: 'Nfa',
  ETB: 'ብር',
  EUR: '€',
  FJD: 'FJ$',
  FKP: 'FK&#163;',
  GBP: '£',
  GEL: 'ლ',
  GHS: '&#x20b5;',
  GIP: '£',
  GMD: 'D',
  GNF: 'FG',
  GTQ: 'Q',
  GYD: 'G$',
  HKD: 'HK$',
  HNL: 'L',
  HRK: 'kn',
  HTG: 'G',
  HUF: 'Ft',
  IDR: 'Rp',
  ILS: '₪',
  INR: '₹',
  IQD: 'ع.د',
  IRR: '&#xfdfc;',
  ISK: 'Kr',
  JMD: '$',
  JOD: 'د.ا',
  JPY: '&#165;',
  KES: 'Ksh',
  KGS: 'Лв',
  KHR: '៛',
  KMF: 'CF',
  KPW: '₩',
  KRW: '₩',
  KWD: 'د.ك',
  KYD: '$',
  KZT: '₸',
  LAK: '₭',
  LBP: 'ل.ل.‎',
  LD: 'ل.د',
  LKR: 'රු',
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
  MNT: '₮',
  MOP: 'P',
  MRO: 'UM',
  MUR: 'Ɍs',
  MVR: 'Rf',
  MWK: 'MK',
  MXN: 'Mex$',
  MYR: 'RM',
  MZN: 'MT',
  NAD: 'N$',
  NGN: '₦',
  NIO: 'C$',
  NOK: 'kr',
  NPR: 'रू',
  NZD: '$',
  OMR: 'ر.ع.',
  PAB: 'B/.',
  PEN: 'S/',
  PGK: 'K',
  PHP: '₱',
  PKR: 'Ɍs',
  PLN: 'Zł',
  PYG: '&#x20b2;',
  QAR: 'QR',
  RON: 'L',
  RSD: 'Дин.',
  RUB: '₽',
  RWF: 'RF',
  SAR: 'SR',
  SBD: 'SI$',
  SCR: 'SRe',
  SDG: '&#163;Sd',
  SEK: 'kr',
  SFR: 'Fr',
  SGD: 'S$',
  SHP: '&#163;',
  SLL: 'Le',
  SOS: 'Sh.so.',
  SRD: '$',
  SSP: '£',
  STD: 'Db',
  SVC: '$',
  SYP: 'S&#163;',
  SZL: 'L',
  THB: '฿',
  TJS: 'SM',
  TMT: 'M',
  TND: 'د.ت',
  TOP: 'T$',
  TRY: 'TL',
  TTD: '$',
  TWD: 'NT$',
  TZS: 'Sh',
  UAH: '&#x20b4;',
  UGX: 'USh',
  USD: '$',
  UYU: '$',
  UZS: "so'm",
  VEF: 'Bs',
  VND: '&#x20ab;',
  VUV: 'VT',
  WST: 'T',
  XAF: 'CFA',
  XCD: 'EC$',
  XOF: 'CFA',
  XPF: 'F',
  YER: '﷼',
  ZAR: 'R',
  ZMK: 'ZK',
  ZWL: 'Z$',
};

/**
 * REMOVE THIS AFTER INTEGRATING API
 * Adding min_value from hard-coded list of currencies
 */
_Obj.loop(currenciesList, (val, key) => {
  if (currenciesConfig[key]) {
    currenciesConfig[key].minimum = currenciesList[key].min_value;
  }
});

/**
 * REMOVE THIS AFTER INTEGRATING API
 * Adding symbol from hard-coded list of currencies
 */
_Obj.loop(currenciesList, (val, key) => {
  if (displayCurrencies[key]) {
    displayCurrencies[key] = currenciesList[key].symbol;
  }
});

/**
 * 1. Add default currency's attribs
 *    to rest of the currencies
 *    as default attribs.
 * 2. Add currency code to the config.
 * 3. Add symbol to the config.
 *
 * This will also add the default config for all the currencies in displayCurrencies
 * whose configs are missing from currenciesConfig.
 */
_Obj.loop(displayCurrencies, (symbol, currency) => {
  currenciesConfig[currency] =
    {}
    |> _Obj.extend(currenciesConfig.default)
    |> _Obj.extend(currenciesConfig[currency] || {});

  currenciesConfig[currency].code = currency;

  if (displayCurrencies[currency]) {
    currenciesConfig[currency].symbol = displayCurrencies[currency];
  }
});

/**
 * TODO
 * Once we start getting currencies from
 * preferences, we would augment the currencies
 * config with the new details, and hence
 * instead of exporting a `const currencies` here,
 * we should be exporting `getCurrencies`
 * which would return the current state of `currencies`.
 */

export const currencies = _Arr.reduce(
  supportedCurrencies,
  (currenciesSoFar, currency) => {
    currenciesSoFar[currency] = displayCurrencies[currency];

    return currenciesSoFar;
  },
  {}
);

/**
 * Formats amount by adding commas and decimal points.
 * @param {Number} amount Amount in the lowest denomination
 * @param {String} currency
 *
 * @return {String}
 */
export function formatAmount(amount, currency) {
  const config = getCurrencyConfig(currency);
  const divided = amount / Math.pow(10, config.decimals);

  return config.format(divided.toFixed(config.decimals), config.decimals);
}

/**
 * Formats amount by adding commas and decimal points
 * and the symbol on the left.
 * @param {Number} amount Amount in the lowest denomination
 * @param {String} currency
 *
 * @return {String}
 */
export function formatAmountWithSymbol(amount, currency) {
  return displayCurrencies[currency] + formatAmount(amount, currency);
}

export function displayAmount(razorpay, payloadAmount) {
  let get = razorpay.get;
  let displayCurrency = get('display_currency');
  if (displayCurrency) {
    let displayAmount = parseFloat(get('display_amount'));

    // Since display amount is in major, we need to convert it into minor.
    displayAmount *= Math.pow(10, getCurrencyConfig(displayCurrency).decimals);

    // Remove any trailing decimals that remain after converting to minor.
    displayAmount = displayAmount.toFixed(0);

    return (
      displayCurrencies[displayCurrency] +
      formatAmount(displayAmount, displayCurrency)
    );
  }
  return formatAmountWithSymbol(
    razorpay.display_amount || payloadAmount || get('amount'),
    get('currency')
  );
}

export const getDecimalAmount = amount =>
  (amount / 100).toFixed(2).replace('.00', '');
