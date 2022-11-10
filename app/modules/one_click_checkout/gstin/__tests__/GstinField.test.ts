import { render, fireEvent } from '@testing-library/svelte';
import GstinField from 'one_click_checkout/gstin/ui/GstinField.svelte';
import gstinLables from 'one_click_checkout/gstin/i18n/en';
import { setupPreferences } from 'tests/setupPreferences';
import { GSTIN } from 'one_click_checkout/gstin/constants';

const {
  add_gstin: ADD_GSTIN,
  gstin_label: GSTIN_LABEL,
  optional: OPTIONAL,
} = gstinLables;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const gstinFieldProps = {
  value: '',
  error: '',
  handleInput: jest.fn(),
  handleBlur: jest.fn(),
};

describe('GSTIN Field to capture GSTIN', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      one_cc_capture_gstin: 'false',
    });
  });
  it('Should render GSTIN CTA', () => {
    const { container } = render(GstinField, gstinFieldProps);

    const toggleGSTINCTA = container.querySelector(
      '[data-test-id=toggle-gstin-cta]'
    )?.textContent;

    expect(toggleGSTINCTA).toContain(`+ ${ADD_GSTIN} ${OPTIONAL}`);
  });

  it('Should render GSTIN input on CTA click', async () => {
    const { getByText, container } = render(GstinField, gstinFieldProps);
    const gstinCTA = container.querySelector('.gstin-label') as HTMLElement;

    await fireEvent.click(gstinCTA);
    const gstinField = container.querySelector(`#${GSTIN}`);

    expect(getByText(GSTIN_LABEL)).toBeInTheDocument();
    expect(gstinField).toBeInTheDocument();
  });

  it('Should render GSTIN input on typing the Field', async () => {
    const { getByText, container } = render(GstinField, gstinFieldProps);
    const gstinCTA = container.querySelector('.gstin-label') as HTMLElement;

    await fireEvent.click(gstinCTA);
    const gstinField = container.querySelector(`#${GSTIN}`) as HTMLElement;

    expect(gstinField).toBeInTheDocument();
    await fireEvent.change(gstinField, { target: { textContent: 'Salem' } });

    expect(getByText(GSTIN_LABEL)).toBeInTheDocument();
    expect(gstinField.textContent).toBe('Salem');
  });
});
