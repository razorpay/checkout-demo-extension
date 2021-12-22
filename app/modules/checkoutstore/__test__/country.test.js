import { get } from 'svelte/store';
import {
  allCountries,
  allStates,
  setAllCountries,
  setStatesByCountryCode,
  getStatesByCountryCodeFromStore,
  getCountryByName,
  getStateByName,
} from '../country';

const testCountry = {
  countryName: 'India',
  countryCode: 'IN',
  countryAlpha3Code: 'IN',
};

const testStates = [
  {
    stateName: 'Karnataka',
    stateCode: 'IN-KA',
  },
  {
    stateName: 'Delhi',
    stateCode: 'IN-DL',
  },
];

describe('Test setAllCountries', () => {
  test('Should set all countries to the allCountries store', () => {
    setAllCountries([
      {
        ...testCountry,
      },
    ]);

    expect(get(allCountries)).toStrictEqual([
      {
        ...testCountry,
      },
    ]);
  });
  test('Should set all states for the country to the allState store', () => {
    setStatesByCountryCode(testCountry.countryCode, testStates.slice(0));

    expect(get(allStates)).toStrictEqual({
      IN: testStates.slice(0),
    });
  });
  test('Should get all states by country code', () => {
    expect(getStatesByCountryCodeFromStore('IN')).toStrictEqual(
      testStates.slice(0)
    );
    expect(getStatesByCountryCodeFromStore('US')).toStrictEqual([]);
  });
  test('Should get country by country name', () => {
    expect(getCountryByName('IN')).toStrictEqual(null);
    expect(getCountryByName('us')).toStrictEqual(null);
    expect(getCountryByName('India')).toStrictEqual({ ...testCountry });
    expect(getCountryByName('INDIA')).toStrictEqual({ ...testCountry });
  });
  test('Should get state by country code and state name', () => {
    expect(getStateByName('IN', 'Delhi')).toStrictEqual({ ...testStates[1] });
    expect(getStateByName('IN', 'delhi')).toStrictEqual({ ...testStates[1] });
    expect(getStateByName('US', 'delhi')).toStrictEqual(null);
    expect(getStateByName('IN', 'KA')).toStrictEqual(null);
  });
});
