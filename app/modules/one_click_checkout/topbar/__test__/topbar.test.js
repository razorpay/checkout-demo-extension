import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Topbar from 'one_click_checkout/topbar/ui/Topbar.svelte';
import topbarLabels from 'one_click_checkout/topbar/i18n/en';
import { setAmount } from 'one_click_checkout/topbar/sessionInterface';
import { activeRoute } from 'one_click_checkout/routing/store';
import { tabTitle } from 'one_click_checkout/topbar/store';
import { showFeeLabel } from 'checkoutstore/fee';
import {
  dynamicFeeObject,
  addCardView,
  showFeesIncl,
} from 'checkoutstore/dynamicfee';
import { isLoggedIn } from 'checkoutstore/customer';

const {
  summary_label: SUMMARY_LABEL,
  address_label: ADDRESS_LABEL,
  payments_label: PAYMENTS_LABEL,
} = topbarLabels;
const COUPONS = 'coupons';

jest.mock('sessionmanager', () => {
  return {
    getSession: jest.fn(() => ({
      get: jest.fn(),
      bindEvents: jest.fn(),
    })),
  };
});

jest.mock('one_click_checkout/topbar/sessionInterface', () => ({
  setAmount: jest.fn(),
}));

describe('Topbar', () => {
  it('Should render the Topbar', () => {
    const { getByText, getByTestId } = render(Topbar);

    expect(getByText(SUMMARY_LABEL)).toBeInTheDocument();
    expect(getByText(ADDRESS_LABEL)).toBeInTheDocument();
    expect(getByText(PAYMENTS_LABEL)).toBeInTheDocument();
    expect(getByTestId('back')).toBeInTheDocument();
  });
  it('Should render the Topbar when back button not presented', async () => {
    const { getByText, queryByTestId } = render(Topbar);

    activeRoute.update((val) => ({ ...val, isBackEnabled: false }));

    await waitFor(() => {
      expect(getByText(SUMMARY_LABEL)).toBeInTheDocument();
      expect(getByText(ADDRESS_LABEL)).toBeInTheDocument();
      expect(getByText(PAYMENTS_LABEL)).toBeInTheDocument();
      expect(queryByTestId('back')).not.toBeInTheDocument();
    });
  });
  it('Should render the Topbar when Topbar Title is presented', async () => {
    const { queryByText, getByTestId, getByText } = render(Topbar);

    activeRoute.update((val) => ({ ...val, isBackEnabled: true }));
    tabTitle.set(COUPONS);
    await waitFor(() => {
      expect(getByText(COUPONS)).toBeInTheDocument();
      expect(queryByText(SUMMARY_LABEL)).not.toBeInTheDocument();
      expect(queryByText(ADDRESS_LABEL)).not.toBeInTheDocument();
      expect(queryByText(PAYMENTS_LABEL)).not.toBeInTheDocument();
      expect(getByTestId('back')).toBeInTheDocument();
    });
  });
  it('Should render Summary and Payments label when user is loggedin', async () => {
    const { queryByText, getByTestId, getByText } = render(Topbar);

    tabTitle.set('');
    isLoggedIn.set(true);
    await waitFor(() => {
      expect(getByText(SUMMARY_LABEL)).toBeInTheDocument();
      expect(queryByText(ADDRESS_LABEL)).not.toBeInTheDocument();
      expect(getByText(PAYMENTS_LABEL)).toBeInTheDocument();
      expect(getByTestId('back')).toBeInTheDocument();
    });
  });
  it('Clicking Back button on the topbar', async () => {
    const { getByTestId } = render(Topbar);

    await fireEvent.click(getByTestId('back'));

    expect(setAmount).toHaveBeenCalledTimes(1);
    expect(get(showFeeLabel)).toEqual(true);
    expect(get(dynamicFeeObject)).toEqual({});
    expect(get(addCardView)).toEqual('');
    expect(get(showFeesIncl)).toEqual({});
  });
});
