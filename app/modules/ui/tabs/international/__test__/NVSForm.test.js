import { get } from 'svelte/store';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import Analytics from 'analytics';

// Store
import { NVSFormData } from 'checkoutstore/screens/international';

// component
import NVSForm from '../NVSForm.svelte';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg) => arg,
  getMode: () => 'test',
};

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: razorpayInstance,
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
  return new Promise((resolve) => {
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
    resolve(response);
  });
});

describe('Test NVSForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    Analytics.setR(razorpayInstance);
  });
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
  test('should call getAllCountries api on mount', async () => {
    render(NVSForm);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  test('should update form fields value', async () => {
    const { container } = render(NVSForm);
    const inputValue = 'form input test value';

    // first name
    const inputFirstName = container.querySelector('#nvs-first_name');
    await fireEvent.input(inputFirstName, { target: { value: inputValue } });
    expect(inputFirstName.value).toBe(inputValue);
    // last name
    const inputLastName = container.querySelector('#nvs-last_name');
    await fireEvent.input(inputLastName, { target: { value: inputValue } });
    expect(inputLastName.value).toBe(inputValue);
    // line 1
    const inputLine1 = container.querySelector('#nvs-line1');
    await fireEvent.input(inputLine1, { target: { value: inputValue } });
    expect(inputLine1.value).toBe(inputValue);
    // line 2
    const inputLine2 = container.querySelector('#nvs-line2');
    await fireEvent.input(inputLine2, { target: { value: inputValue } });
    expect(inputLine2.value).toBe(inputValue);
    // city
    const inputCity = container.querySelector('#nvs-city');
    await fireEvent.input(inputCity, { target: { value: inputValue } });
    expect(inputCity.value).toBe(inputValue);
    // postal code
    const inputPostalCode = container.querySelector('#nvs-postal_code');
    await fireEvent.input(inputPostalCode, { target: { value: inputValue } });
    expect(inputPostalCode.value).toBe(inputValue);
    // country
    const inputCountry = container.querySelector('#nvs-country');
    await fireEvent.input(inputCountry, { target: { value: inputValue } });
    expect(inputCountry.value).toBe(inputValue);
    // state
    const inputState = container.querySelector('#nvs-state');
    await fireEvent.input(inputState, { target: { value: inputValue } });
    expect(inputState.value).toBe(inputValue);

    // check if store is updated
    expect(get(NVSFormData)).toStrictEqual({
      city: inputValue,
      country: inputValue,
      first_name: inputValue,
      last_name: inputValue,
      line1: inputValue,
      line2: inputValue,
      postal_code: inputValue,
      state: inputValue,
    });
  });
});
