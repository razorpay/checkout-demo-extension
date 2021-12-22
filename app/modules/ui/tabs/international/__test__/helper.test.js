import { toTitleCase } from 'lib/utils';

import Analytics from 'analytics';

import {
  createNVSFormInputs,
  createSearchModalProps,
  updateSearchModalCountries,
  updateSearchModalStates,
  getAllCountries,
  getStatesWithCountryCode,
} from '../helper';

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg) => arg,
  getMode: jest.fn(),
};

let countriesResponse = [
  {
    countryName: 'united states',
    countryAlpha2Code: 'us',
    countryAlpha3Code: 'USA',
  },
  { countryName: 'canada', countryAlpha2Code: 'ca', countryAlpha3Code: 'CAN' },
];

let statesResponse = {
  CA: {
    countryName: 'canada',
    countryAlpha2Code: 'ca',
    countryAlpha3Code: 'CAN',
    states: [
      { stateName: 'Alberta', stateCode: 'CA-AB' },
      { stateName: 'British Columbia', stateCode: 'CA-BC' },
    ],
  },
};

global.fetch = jest.fn((options) => {
  let response = {
    error: {
      message: 'Invalid country code',
    },
  };
  let countryCode = 'CA';
  if (options.url.includes('countries')) {
    response = countriesResponse.map((obj) => ({ ...obj }));
  }
  if (options.url.includes(`states/${countryCode}`)) {
    response = {
      ...statesResponse[countryCode],
      states: statesResponse[countryCode].states.map((obj) => ({ ...obj })),
    };
  }
  options.callback(response);
});

const getAllCountriesPromise = (...args) => {
  return new Promise((resolve, reject) => {
    getAllCountries(...args).then(resolve, reject);
  });
};

const getStatesByCountryCodePromise = (...args) => {
  return new Promise((resolve, reject) => {
    getStatesWithCountryCode(...args).then(resolve, reject);
  });
};

const t = jest.fn((arg) => arg);

const testSearchModalProps = {
  country: {
    title: 'card.avs_country_search_title',
    placeholder: 'card.avs_country_search_title',
    data: [],
    keys: ['label'],
    all: 'card.avs_country_all',
  },
  state: {
    title: 'card.avs_state_search_title',
    placeholder: 'card.avs_state_search_title',
    keys: ['label'],
    data: [],
    all: 'card.avs_state_all',
  },
};

describe('Test createNVSFormInputs', () => {
  test('should create NVS form input fields', () => {
    expect(createNVSFormInputs(t)).toStrictEqual([
      [
        {
          id: 'first_name',
          placeholder: 'international.nvs_first_name',
          required: true,
        },
        {
          id: 'last_name',
          placeholder: 'international.nvs_last_name',
          required: true,
        },
      ],
      {
        id: 'line1',
        placeholder: 'card.avs_form_address_line_1',
        required: true,
      },
      { id: 'line2', placeholder: 'card.avs_form_address_line_2' },
      [
        { id: 'city', placeholder: 'card.avs_form_city', required: true },
        {
          id: 'postal_code',
          placeholder: 'card.avs_form_zip_code',
          required: true,
        },
      ],
      [
        {
          id: 'country',
          type: 'search',
          placeholder: 'card.avs_form_country',
          required: true,
        },
        {
          id: 'state',
          type: 'search',
          placeholder: 'card.avs_form_state',
          required: true,
        },
      ],
    ]);
  });
});
describe('Test createSearchModalProps, updateSearchModalCountries, updateSearchModalStates', () => {
  test('should create search modal props with empty country and states', () => {
    expect(createSearchModalProps(t)).toStrictEqual({
      ...testSearchModalProps,
    });
  });
  test('should update search modal props countries', () => {
    expect(
      updateSearchModalCountries({ ...testSearchModalProps }, [])
    ).toStrictEqual({
      ...testSearchModalProps,
    });
    expect(
      updateSearchModalCountries(
        {
          country: { ...testSearchModalProps.country },
          state: { ...testSearchModalProps.state },
        },
        [
          {
            countryName: 'India',
            countryCode: 'IN',
          },
          {
            countryName: 'Canada',
            countryCode: 'CA',
          },
        ]
      )
    ).toStrictEqual({
      country: {
        ...testSearchModalProps.country,
        data: [
          {
            _key: 'IN',
            label: 'India',
            type: 'country',
          },
          {
            _key: 'CA',
            label: 'Canada',
            type: 'country',
          },
        ],
      },
      state: { ...testSearchModalProps.state },
    });
  });
  test('should update search modal props states', () => {
    expect(updateSearchModalStates(null)).toStrictEqual(null);
    expect(
      updateSearchModalStates(
        {
          country: { ...testSearchModalProps.country },
          state: { ...testSearchModalProps.state },
        },
        []
      )
    ).toStrictEqual({
      country: { ...testSearchModalProps.country },
      state: { ...testSearchModalProps.state },
    });
    expect(
      updateSearchModalStates(
        {
          country: { ...testSearchModalProps.country },
          state: { ...testSearchModalProps.state },
        },
        [
          {
            stateName: 'Delhi',
            stateCode: 'IN-DL',
          },
        ]
      )
    ).toStrictEqual({
      country: { ...testSearchModalProps.country },
      state: {
        ...testSearchModalProps.state,
        data: [
          {
            _key: 'IN-DL',
            label: 'Delhi',
            type: 'state',
          },
        ],
      },
    });
  });
});

describe('Test getAllCountries, getStatesWithCountryCode', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
    fetch.mockClear();
  });
  test('should call getAllCountries api', async () => {
    const countries = await getAllCountriesPromise(razorpayInstance);
    expect(countries).toStrictEqual(
      countriesResponse.map((country) => {
        return {
          countryName: toTitleCase(country.countryName),
          countryCode: country.countryAlpha2Code.toUpperCase(),
          countryAlpha3Code: country.countryAlpha3Code,
        };
      })
    );
  });
  test('should call getStatesByCountryCode api', async () => {
    let countryCode = 'CA';
    const states = await getStatesByCountryCodePromise(
      razorpayInstance,
      countryCode
    );
    expect(states).toStrictEqual(statesResponse[countryCode].states);

    countryCode = 'IN';
    try {
      await getStatesByCountryCodePromise(razorpayInstance, countryCode);
    } catch (error) {
      expect(error).toStrictEqual({
        message: 'Invalid country code',
      });
    }
  });
});
