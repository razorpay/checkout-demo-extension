const countries = [
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
];

const states = {
  gb: {
    countryName: 'united kingdom',
    countryAlpha2Code: 'gb',
    countryAlpha3Code: 'GBR',
    states: [
      { stateName: 'England', stateCode: 'GB-ENG' },
      { stateName: 'Northern Ireland', stateCode: 'GB-NIR' },
      { stateName: 'Scotland', stateCode: 'GB-SCT' },
      { stateName: 'Wales', stateCode: 'GB-WLS' },
    ],
  },
  ca: {
    countryName: 'canada',
    countryAlpha2Code: 'ca',
    countryAlpha3Code: 'CAN',
    states: [
      { stateName: 'Alberta', stateCode: 'CA-AB' },
      { stateName: 'British Columbia', stateCode: 'CA-BC' },
      { stateName: 'Manitoba', stateCode: 'CA-MB' },
      { stateName: 'New Brunswick', stateCode: 'CA-NB' },
      { stateName: 'Newfoundland and Labrador', stateCode: 'CA-NL' },
      { stateName: 'Northwest Territories', stateCode: 'CA-NT' },
      { stateName: 'Nova Scotia', stateCode: 'CA-NS' },
      { stateName: 'Nunavut', stateCode: 'CA-NU' },
      { stateName: 'Ontario', stateCode: 'CA-ON' },
      { stateName: 'Prince Edward Island', stateCode: 'CA-PE' },
      { stateName: 'Quebec', stateCode: 'CA-QC' },
      { stateName: 'Saskatchewan', stateCode: 'CA-SK' },
      { stateName: 'Yukon', stateCode: 'CA-YT' },
    ],
  },
};

module.exports = {
  countries,
  states,
};
