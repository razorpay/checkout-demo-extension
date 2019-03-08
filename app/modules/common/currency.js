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
  },

  AFN: {
    minor: 'pul',
  },

  ALL: {
    minor: 'qindarka',
  },

  AMD: {
    minor: 'luma',
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
  },

  AUD: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minimum: 50,
    minor: 'cent',
  },

  AWG: {
    minor: 'cent',
  },

  AZN: {
    minor: 'qäpik',
  },

  BAM: {
    minor: 'fenning',
  },

  BBD: {
    minor: 'cent',
  },

  BDT: {
    minor: 'paisa',
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
  },

  BND: {
    minor: 'sen',
  },

  BOB: {
    minor: 'centavo',
  },

  BRL: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minimum: 50,
    minor: 'centavo',
  },

  BSD: {
    minor: 'cent',
  },

  BTN: {
    minor: 'chetrum',
  },

  BWP: {
    minor: 'thebe',
  },

  BYR: {
    decimals: 0,
    major: 'ruble',
  },

  BZD: {
    minor: 'cent',
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
  },

  COP: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centavo',
  },

  CRC: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'centimo',
  },

  CUC: {
    minor: 'centavo',
  },

  CUP: {
    minor: 'centavo',
  },

  CVE: {
    minor: 'centavo',
  },

  CZK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'haler',
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
  },

  DZD: {
    minor: 'centime',
  },

  EGP: {
    minor: 'piaster',
  },

  ERN: {
    minor: 'cent',
  },

  ETB: {
    minor: 'cent',
  },

  EUR: {
    minimum: 50,
    minor: 'cent',
  },

  FJD: {
    minor: 'cent',
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
  },

  GMD: {
    minor: 'butut',
  },

  GTQ: {
    minor: 'centavo',
  },

  GYD: {
    minor: 'cent',
  },

  HKD: {
    minimum: 400,
    minor: 'cent',
  },

  HNL: {
    minor: 'centavo',
  },

  HRK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'lipa',
  },

  HTG: {
    minor: 'centime',
  },

  HUF: {
    decimals: 0,
    format: CURRENCY_FORMATTERS.none,
    major: 'forint',
  },

  IDR: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'sen',
  },

  ILS: {
    minor: 'agorot',
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
  },

  KGS: {
    minor: 'tyyn',
  },

  KHR: {
    minor: 'sen',
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
  },

  KZT: {
    minor: 'tiyn',
  },

  LAK: {
    minor: 'at',
  },

  LBP: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minor: 'piastre',
  },

  LKR: {
    minor: 'cent',
  },

  LRD: {
    minor: 'cent',
  },

  LSL: {
    minor: 'lisente',
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
  },

  MDL: {
    minor: 'ban',
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
  },

  MNT: {
    minor: 'mongo',
  },

  MOP: {
    minor: 'avo',
  },

  MRO: {
    minor: 'khoum',
  },

  MUR: {
    minor: 'cent',
  },

  MVR: {
    minor: 'lari',
  },

  MWK: {
    minor: 'tambala',
  },

  MXN: {
    minimum: 1000,
    minor: 'centavo',
  },

  MYR: {
    minor: 'sen',
  },

  MZN: {
    decimals: 0,
    major: 'metical',
  },

  NAD: {
    minor: 'cent',
  },

  NGN: {
    minor: 'kobo',
  },

  NIO: {
    minor: 'centavo',
  },

  NOK: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minimum: 300,
    minor: 'øre',
  },

  NPR: {
    minor: 'paise',
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
  },

  PGK: {
    minor: 'toea',
  },

  PHP: {
    minor: 'centavo',
  },

  PKR: {
    minor: 'paisa',
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
  },

  RON: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'bani',
  },

  RUB: {
    format: CURRENCY_FORMATTERS.threecommadecimal,
    minor: 'kopeck',
  },

  RWF: {
    decimals: 0,
    major: 'franc',
    minor: 'centime',
  },

  SAR: {
    minor: 'halalat',
  },

  SBD: {
    minor: 'cent',
  },

  SCR: {
    minor: 'cent',
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
  },

  SOS: {
    minor: 'centesimi',
  },

  SRD: {
    minor: 'cent',
  },

  STD: {
    minor: 'centimo',
  },

  SVC: {
    minor: 'centavo',
  },

  SYP: {
    minor: 'piaster',
  },

  SZL: {
    format: CURRENCY_FORMATTERS.szl,
    minor: 'cent',
  },

  THB: {
    minor: 'satang',
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
  },

  TWD: {
    minor: 'cent',
  },

  TZS: {
    minor: 'cent',
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
  },

  UZS: {
    minor: 'tiyin',
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
  },

  ZAR: {
    format: CURRENCY_FORMATTERS.threespaceseparator,
    minor: 'cent',
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
  CUP: '$',
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
  INR: '₹',
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
  SSP: '&#163;',
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
