import { render, fireEvent } from '@testing-library/svelte';
import AccountModal from 'one_click_checkout/account_modal/ui/AccountModal.svelte';
import { setupPreferences } from 'tests/setupPreferences';
import Analytics from 'analytics';
import { popStack } from 'navstack';
import { handleEditContact } from 'one_click_checkout/sessionInterface';
import { logUserOut } from 'checkoutframe/customer';
import labels from 'i18n/bundles/en';
import accountModalLabels from 'one_click_checkout/account_modal/i18n/en';

const { title: MODAL_TITLE, change_language: CHANGE_LANGUAGE_LABEL } =
  accountModalLabels;
const {
  edit_contact_action: EDIT_CONTACT_DETAIL,
  logout_action: LOGOUT_LABEL,
  logout_all_devices_action: LOGOUT_ALL_DEVICES_LABEL,
} = labels.misc;
const { back_action: BACK_BUTTON_LABEL } = labels.offers;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const accountModalProps = {
  options: {},
};

jest.mock('one_click_checkout/common/helpers/customer', () => ({
  isUserLoggedIn: jest.fn(() => true),
}));

jest.mock('navstack', () => ({
  popStack: jest.fn(),
}));

jest.mock('one_click_checkout/sessionInterface', () => ({
  handleEditContact: jest.fn(),
}));

jest.mock('checkoutframe/customer', () => ({
  logUserOut: jest.fn(),
}));

jest.mock('sessionmanager', () => {
  return {
    getSession: jest.fn(() => ({
      get: jest.fn(),
      bindEvents: jest.fn(),
    })),
  };
});

describe('Account Modal', () => {
  beforeEach(() => {
    setupPreferences();
    Analytics.setR(razorpayInstance);
  });
  it('Should render the Account Modal when user non logged In', () => {
    const { getByText, container } = render(AccountModal, accountModalProps);
    const accountCTA = container.querySelector(
      '[data-test-id=account-lang-cta]'
    ).innerHTML;

    expect(getByText(MODAL_TITLE)).toBeInTheDocument();
    expect(accountCTA).toContain(CHANGE_LANGUAGE_LABEL);
  });
  it('Should render the Account Modal when user logged In', () => {
    const { getByText, container } = render(AccountModal, accountModalProps);
    const accountCTA = container.querySelector(
      '[data-test-id=account-lang-cta]'
    ).innerHTML;

    expect(getByText(MODAL_TITLE)).toBeInTheDocument();
    expect(getByText(EDIT_CONTACT_DETAIL)).toBeInTheDocument();
    expect(getByText(LOGOUT_LABEL)).toBeInTheDocument();
    expect(getByText(LOGOUT_ALL_DEVICES_LABEL)).toBeInTheDocument();
    expect(accountCTA).toContain(CHANGE_LANGUAGE_LABEL);
  });
  it('Clicking on Edit contact detail on Account Modal when user logged In', async () => {
    const { container } = render(AccountModal, accountModalProps);
    const editContactDetailCTA = container.querySelector(
      '[data-test-id="edit-contact-account"]'
    );

    await fireEvent.click(editContactDetailCTA);
    expect(popStack).toHaveBeenCalledTimes(1);
    expect(handleEditContact).toHaveBeenCalledTimes(1);
  });
  it('Clicking on Change Language on Account Modal', async () => {
    const { container, getByText, queryByText } = render(
      AccountModal,
      accountModalProps
    );
    const langChangeCTA = container.querySelector(
      '[data-test-id="account-lang-cta"]'
    );

    await fireEvent.click(langChangeCTA);
    expect(getByText(CHANGE_LANGUAGE_LABEL)).toBeInTheDocument();

    const langList = container.querySelector('.language-container');
    expect(langList).toBeVisible();

    const backBtn = container.querySelector('.back-btn-container');
    await fireEvent.click(backBtn);

    expect(langList).not.toBeVisible();
    expect(queryByText(BACK_BUTTON_LABEL)).not.toBeInTheDocument();
  });
  it('Clicking on Logout on Account Modal when user logged In', async () => {
    const { container } = render(AccountModal, accountModalProps);
    const logoutCTA = container.querySelector(
      '[data-test-id="account-logout-cta"]'
    );

    await fireEvent.click(logoutCTA);
    expect(popStack).toHaveBeenCalledTimes(1);
    expect(logUserOut).toHaveBeenCalledTimes(1);
  });
  it('Clicking on Logout from all devices on Account Modal when user logged In', async () => {
    const { container } = render(AccountModal, accountModalProps);
    const logoutAllDevicesCTA = container.querySelector(
      '[data-test-id="account-logoutall-cta"]'
    );

    await fireEvent.click(logoutAllDevicesCTA);
    expect(popStack).toHaveBeenCalledTimes(1);
    expect(logUserOut).toHaveBeenCalledTimes(1);
  });
  it('Clicking on Chevron icon to close the Account Modal', async () => {
    const { container } = render(AccountModal, accountModalProps);
    const modalCloseCTA = container.querySelector('.account-toggle-icon');

    await fireEvent.click(modalCloseCTA);
    expect(popStack).toHaveBeenCalledTimes(1);
  });
});
