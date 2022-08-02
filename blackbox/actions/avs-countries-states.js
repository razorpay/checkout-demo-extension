async function expectCountriesAPI({ expectRequest, respondJSON }) {
  await expectRequest(({ URL }) => {
    expect(URL).toContain('/v1/countries');
  });
  await respondJSON([
    {
      countryName: 'united kingdom',
      countryAlpha2Code: 'gb',
      countryAlpha3Code: 'GBR',
    },
    {
      countryName: 'Australia',
      countryAlpha2Code: 'au',
      countryAlpha3Code: 'AUS',
    },
  ]);
}

async function expectStatesAPI({ expectRequest, respondJSON }) {
  await expectRequest(({ URL }) => {
    expect(URL).toContain('/v1/states');
  });
  await respondJSON({
    countryName: 'united kingdom',
    countryAlpha2Code: 'gb',
    countryAlpha3Code: 'GBR',
    states: [{ stateName: 'England', stateCode: 'GB-ENG' }],
  });
}

module.exports = {
  expectCountriesAPI,
  expectStatesAPI,
};
