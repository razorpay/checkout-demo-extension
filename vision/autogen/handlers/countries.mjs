export default function* handleCountries() {
  yield BASE_COUNTRIES;
}

const BASE_COUNTRIES = [
  { countryName: 'austria', countryAlpha2Code: 'at', countryAlpha3Code: 'AUT' },
  { countryName: 'belgium', countryAlpha2Code: 'be', countryAlpha3Code: 'BEL' },
  {
    countryName: 'czech republic',
    countryAlpha2Code: 'cz',
    countryAlpha3Code: 'CZE',
  },
  { countryName: 'denmark', countryAlpha2Code: 'dk', countryAlpha3Code: 'DNK' },
  { countryName: 'estonia', countryAlpha2Code: 'ee', countryAlpha3Code: 'EST' },
  { countryName: 'finland', countryAlpha2Code: 'fi', countryAlpha3Code: 'FIN' },
  { countryName: 'germany', countryAlpha2Code: 'de', countryAlpha3Code: 'DEU' },
  { countryName: 'latvia', countryAlpha2Code: 'lv', countryAlpha3Code: 'LVA' },
  {
    countryName: 'lithuania',
    countryAlpha2Code: 'lt',
    countryAlpha3Code: 'LTU',
  },
  {
    countryName: 'netherlands',
    countryAlpha2Code: 'nl',
    countryAlpha3Code: 'NLD',
  },
  { countryName: 'norway', countryAlpha2Code: 'no', countryAlpha3Code: 'NOR' },
  { countryName: 'poland', countryAlpha2Code: 'pl', countryAlpha3Code: 'POL' },
  {
    countryName: 'slovakia',
    countryAlpha2Code: 'sk',
    countryAlpha3Code: 'SVK',
  },
  { countryName: 'spain', countryAlpha2Code: 'es', countryAlpha3Code: 'ESP' },
  { countryName: 'sweden', countryAlpha2Code: 'se', countryAlpha3Code: 'SWE' },
  {
    countryName: 'united kingdom',
    countryAlpha2Code: 'gb',
    countryAlpha3Code: 'GBR',
  },
  {
    countryName: 'australia',
    countryAlpha2Code: 'au',
    countryAlpha3Code: 'AUS',
  },
  {
    countryName: 'new zealand',
    countryAlpha2Code: 'nz',
    countryAlpha3Code: 'NZL',
  },
  {
    countryName: 'united states',
    countryAlpha2Code: 'us',
    countryAlpha3Code: 'USA',
  },
  { countryName: 'canada', countryAlpha2Code: 'ca', countryAlpha3Code: 'CAN' },
  { countryName: 'italy', countryAlpha2Code: 'it', countryAlpha3Code: 'ITA' },
  {
    countryName: 'switzerland',
    countryAlpha2Code: 'ch',
    countryAlpha3Code: 'CHE',
  },
];
