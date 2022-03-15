import { get } from 'svelte/store';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import Analytics from 'analytics';

// Store
import { AVSBillingAddress } from 'checkoutstore/screens/card';

// component
import AVSForm from '../AVSForm.svelte';

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

describe('Test AVSForm', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
  });
  afterEach(() => {
    cleanup();
  });
  test('should render without breaking', () => {
    const { component } = render(AVSForm);
    expect(component).toBeTruthy();
  });
  test('should render all the fields', () => {
    const { getAllByRole } = render(AVSForm);
    const allInputs = getAllByRole('textbox');
    expect(allInputs).toHaveLength(6);
  });
  test('should have required fields except address line 2', () => {
    const { getAllByRole } = render(AVSForm);
    const allInputs = getAllByRole('textbox');
    const requiredFields = Array.from(allInputs).filter((input) => {
      return input.getAttribute('required') !== null;
    });
    expect(requiredFields).toHaveLength(5);
  });
  test('should update form fields value', async () => {
    const { container } = render(AVSForm);
    const inputValue = 'form input test value';
    // line 1
    const inputLine1 = container.querySelector('#avs-line1');
    await fireEvent.input(inputLine1, { target: { value: inputValue } });
    expect(inputLine1.value).toBe(inputValue);
    // line 2
    const inputLine2 = container.querySelector('#avs-line2');
    await fireEvent.input(inputLine2, { target: { value: inputValue } });
    expect(inputLine2.value).toBe(inputValue);
    // city
    const inputCity = container.querySelector('#avs-city');
    await fireEvent.input(inputCity, { target: { value: inputValue } });
    expect(inputCity.value).toBe(inputValue);
    // postal code
    const inputPostalCode = container.querySelector('#avs-postal_code');
    await fireEvent.input(inputPostalCode, { target: { value: inputValue } });
    expect(inputPostalCode.value).toBe(inputValue);
    // country
    const inputCountry = container.querySelector('#avs-country');
    await fireEvent.input(inputCountry, { target: { value: inputValue } });
    expect(inputCountry.value).toBe(inputValue);
    // state
    const inputState = container.querySelector('#avs-state');
    await fireEvent.input(inputState, { target: { value: inputValue } });
    expect(inputState.value).toBe(inputValue);

    // check if store is updated
    expect(get(AVSBillingAddress)).toStrictEqual({
      city: inputValue,
      country: inputValue,
      line1: inputValue,
      line2: inputValue,
      postal_code: inputValue,
      state: inputValue,
    });
  });
});
