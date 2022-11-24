import { render, fireEvent } from '@testing-library/svelte';
import LandmarkField from 'one_click_checkout/address/ui/components/LandmarkField.svelte';
import addressLabels from 'one_click_checkout/address/i18n/en';
import { setupPreferences } from 'tests/setupPreferences';

const { landmark_label: LANDMARK_LABEL, add_landmark: ADD_LANDMARK } =
  addressLabels;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const landmarkFieldProps = {
  id: 'landmark',
  label: 'address.landmark_label',
  validationText: '',
  value: '',
  autofocus: false,
  onBlur: jest.fn(),
  onInput: jest.fn(),
  onSelect: jest.fn(),
  suggestionsResource: jest.fn(),
  handleValidation: jest.fn(),
};

describe('Landmark field on Add New Address Normal(default) flow', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc_address_flow_exp': 'false',
    });
  });
  it('Should render Landmark CTA on the Add New Address', () => {
    const { container } = render(LandmarkField, landmarkFieldProps);

    const toggleLandmarkCTA = container.querySelector(
      '[data-test-id=toggle-landmark-cta]'
    ).textContent;

    expect(toggleLandmarkCTA).toContain(`+ ${ADD_LANDMARK}`);
  });
  it('Should render landmark input on CTA click', async () => {
    const { getByText, container } = render(LandmarkField, landmarkFieldProps);
    const showLandmarkBtn = container.querySelector('.show-landmark-label');

    await fireEvent.click(showLandmarkBtn);
    const landmarkField = container.querySelector('#landmark');

    expect(getByText(LANDMARK_LABEL)).toBeInTheDocument();
    expect(landmarkField).toBeInTheDocument();
  });
  it('Should render landmark input on typing the Field', async () => {
    const { getByText, container } = render(LandmarkField, landmarkFieldProps);
    const showLandmarkBtn = container.querySelector('.show-landmark-label');

    await fireEvent.click(showLandmarkBtn);
    const landmarkField = container.querySelector('#landmark');

    expect(landmarkField).toBeInTheDocument();
    await fireEvent.change(landmarkField, { target: { textContent: 'Salem' } });

    expect(getByText(LANDMARK_LABEL)).toBeInTheDocument();
    expect(landmarkField.textContent).toBe('Salem');
  });
});
