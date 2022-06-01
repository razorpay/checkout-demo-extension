// constants
import { FORM_TYPE, FORM_FIELDS } from '../types';
import { FORM_FIELDS_TYPE_MAPPING } from '../constants';
import fetch from 'utils/fetch';

// testable
import {
  createFormFields,
  createSearchModalFields,
  combineFormValues,
  validateFormValues,
  getAllCountries,
  getStatesWithCountryCode,
} from '../helper';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_testkey',
  get: (arg: unknown) => arg,
  getMode: () => 'test',
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
  countryName: 'canada',
  countryAlpha2Code: 'ca',
  countryAlpha3Code: 'CAN',
  states: [
    { stateName: 'Alberta', stateCode: 'CA-AB' },
    { stateName: 'British Columbia', stateCode: 'CA-BC' },
  ],
};

jest.mock('utils/fetch', () => ({
  default: jest.fn(),
  __esModule: true,
}));

describe('Test createFormFields', () => {
  it('should return fields for AVS', () => {
    const t = jest.fn((a) => a);
    const expected = [
      {
        id: 'line1',
      },
      {
        id: 'line2',
      },
      [
        {
          id: 'city',
        },
        {
          id: 'postal_code',
        },
      ],
      [
        {
          id: 'country',
        },
        {
          id: 'state',
        },
      ],
    ];
    expect(
      createFormFields(t, FORM_FIELDS_TYPE_MAPPING[FORM_TYPE.AVS])
    ).toMatchObject(expected);
  });
  it('should return fields for N_AVS', () => {
    const t = jest.fn((a) => a);
    const expected = [
      [
        {
          id: 'first_name',
        },
        {
          id: 'last_name',
        },
      ],
      {
        id: 'line1',
      },
      {
        id: 'line2',
      },
      [
        {
          id: 'city',
        },
        {
          id: 'postal_code',
        },
      ],
      [
        {
          id: 'country',
        },
        {
          id: 'state',
        },
      ],
    ];
    expect(
      createFormFields(t, FORM_FIELDS_TYPE_MAPPING[FORM_TYPE.N_AVS])
    ).toMatchObject(expected);
  });
});

describe('Test createSearchModalFields', () => {
  it('Should return countries and states fields', () => {
    const t = jest.fn((a) => 'translated');
    expect(createSearchModalFields(t)).toEqual({
      [FORM_FIELDS.country]: {
        data: [],
        keys: ['label'],
        all: 'translated',
        title: 'translated',
        placeholder: 'translated',
      },
      [FORM_FIELDS.state]: {
        data: [],
        keys: ['label'],
        all: 'translated',
        title: 'translated',
        placeholder: 'translated',
      },
    });
  });
  it('Should return countries and states fields with default values', () => {
    const t = jest.fn((a) => 'translated');
    expect(createSearchModalFields(t)).toEqual({
      [FORM_FIELDS.country]: {
        data: [],
        keys: ['label'],
        all: 'translated',
        title: 'translated',
        placeholder: 'translated',
      },
      [FORM_FIELDS.state]: {
        data: [],
        keys: ['label'],
        all: 'translated',
        title: 'translated',
        placeholder: 'translated',
      },
    });
  });
});

describe('Test combineFormValues', () => {
  it('Should combine formValues with pre-filled values', () => {
    const preFilledValues = {
      line1: '123 Main St',
      line2: 'Apt. 1',
      city: 'New York',
      postal_code: '10001',
      country: '',
      state: '',
    };

    const formValues = {
      country: 'US',
      state: 'NY',
    };

    expect(combineFormValues(formValues, preFilledValues)).toEqual({
      line1: '123 Main St',
      line2: 'Apt. 1',
      city: 'New York',
      postal_code: '10001',
      country: 'US',
      state: 'NY',
    });
  });
});

describe('Test validateFormValues', () => {
  it('Should validate input with blank spaces', () => {
    const formValues = {
      line1: '123 Main St   ',
      line2: '     Apt. 1',
      city: '    New  York ',
      postal_code: '      10001',
      country: '     ',
      state: '   ',
    };

    const errors = {
      line1: false,
      line2: false,
      city: false,
      postal_code: false,
      country: true,
      state: true,
    };

    expect(validateFormValues(formValues)).toEqual({
      errors,
      isValid: false,
    });
  });

  it('Should validate input with only special characters', () => {
    const formValues = {
      line1: '@@+-.',
      line2: '@@@@',
      city: '123_',
      postal_code: '.....',
      country: '    .',
      state: '+    /',
    };
    expect(validateFormValues(formValues)).toEqual({
      errors: {
        line1: true,
        line2: false,
        city: false,
        postal_code: true,
        country: true,
        state: true,
      },
      isValid: false,
    });
  });
});

describe('Test getAllCountries', () => {
  it('Should fetch countries', async () => {
    let callback = () => {};
    (fetch as unknown as jest.Mock).mockImplementationOnce((args) => {
      if (args.callback) {
        callback = args.callback;
        args.callback(countriesResponse);
      }
      return countriesResponse;
    });
    const response = [
      {
        _key: 'US',
        key: 'US',
        label: 'United States',
        type: 'country',
      },
      {
        _key: 'CA',
        key: 'CA',
        label: 'Canada',
        type: 'country',
      },
    ];

    expect(await getAllCountries(razorpayInstance)).toStrictEqual(response);
    expect(fetch).toHaveBeenCalledWith({
      url: expect.stringMatching('/v1/countries'),
      callback,
    });
  });
});

describe('Test getStatesWithCountryCode', () => {
  it('Should fetch CA states', async () => {
    let callback = () => {};
    (fetch as unknown as jest.Mock).mockImplementationOnce((args) => {
      if (args.callback) {
        callback = args.callback;
        args.callback(statesResponse);
      }
      return statesResponse;
    });
    const response = [
      {
        _key: 'CA-AB',
        key: 'CA-AB',
        label: 'Alberta',
        type: 'state',
      },
      {
        _key: 'CA-BC',
        key: 'CA-BC',
        label: 'British Columbia',
        type: 'state',
      },
    ];

    expect(
      await getStatesWithCountryCode(razorpayInstance, 'CA')
    ).toStrictEqual(response);
    expect(fetch).toHaveBeenCalledWith({
      url: expect.stringMatching('/v1/states/ca'),
      callback,
    });
  });
});
