import { render, cleanup } from '@testing-library/svelte';
import NVSForm from '../NVSForm.svelte';

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: {
        id: 'id',
        key: 'rzp_test_key',
        get: (arg) => arg,
        getMode: jest.fn(),
      },
    }),
  };
});

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

describe('Test NVSForm', () => {
  afterEach(() => {
    cleanup();
  });
  test('should render without breaking', () => {
    const { component } = render(NVSForm);
    expect(component).toBeTruthy();
  });
  test('should render all the fields', () => {
    const { getAllByRole } = render(NVSForm);
    const allInputs = getAllByRole('textbox');
    expect(allInputs).toHaveLength(8);
  });
  test('should have required fields except address line 2', () => {
    const { getAllByRole } = render(NVSForm);
    const allInputs = getAllByRole('textbox');
    const requiredFields = Array.from(allInputs).filter((input) => {
      return input.getAttribute('required') !== null;
    });
    expect(requiredFields).toHaveLength(7);
  });
});
