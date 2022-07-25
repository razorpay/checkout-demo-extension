import { render, fireEvent, waitFor } from '@testing-library/svelte';
import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';
import { setupPreferences } from 'tests/setupPreferences';
import Analytics from 'analytics';
import labels from 'i18n/bundles/en';
import accountModalLabels from 'one_click_checkout/account_modal/i18n/en';
import { showAccountModal } from 'one_click_checkout/account_modal';

const { title: MODAL_TITLE } = accountModalLabels;
const { secured_by: SECURED_BY } = labels.popup;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const accountTabProps = {
  showAccountTab: true,
};

jest.mock('razorpay/helper/1cc', () => ({
  isOneClickCheckout: jest.fn(() => true),
}));

jest.mock('one_click_checkout/account_modal', () => ({
  showAccountModal: jest.fn(),
}));

jest.mock('sessionmanager', () => {
  return {
    getSession: jest.fn(() => ({
      get: jest.fn(),
      bindEvents: jest.fn(),
    })),
  };
});

describe('Account Tab', () => {
  beforeEach(() => {
    setupPreferences();
    Analytics.setR(razorpayInstance);
  });
  it('Should render the Account Tab', async () => {
    const { getByText } = render(AccountTab, accountTabProps);

    await waitFor(() => {
      expect(getByText(MODAL_TITLE)).toBeInTheDocument();
      expect(getByText(SECURED_BY)).toBeInTheDocument();
    });
  });
  it('Clicking on Account Tab CTA on Account Tab', async () => {
    const { container } = render(AccountTab, accountTabProps);
    await waitFor(async () => {
      const accountTabCTA = container.querySelector(
        '[data-test-id="account-tab-btn"]'
      );

      await fireEvent.click(accountTabCTA);
      expect(showAccountModal).toHaveBeenCalledTimes(1);
    });
  });
});
