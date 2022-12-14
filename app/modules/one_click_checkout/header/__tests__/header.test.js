import { themeStore } from 'checkoutstore/theme';
import Header from 'one_click_checkout/header/Header.svelte';
import { render } from '@testing-library/svelte';
import { activeRoute } from 'one_click_checkout/routing/store';
import { headerHiddenOnScroll } from 'one_click_checkout/header/store';
import { views } from 'one_click_checkout/routing/constants';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getMerchantName: jest.fn(() => 'Name'),
  isOneClickCheckout: jest.fn(() => true),
}));

describe('1CC header', () => {
  beforeEach(async () => {
    themeStore.set({
      textColor: '#FFFFFF',
    });
  });
  it('Should be expanded on L0 screen', () => {
    activeRoute.set({ name: views.COUPONS });
    const { getByText } = render(Header);
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('en-EN')).toBeInTheDocument();
  });

  it('Should be collapsed on screens other than L0', () => {
    activeRoute.set({ name: views.METHODS });
    const { queryByText, getByText } = render(Header);
    expect(getByText('Name')).toBeInTheDocument();
    expect(queryByText('en-EN')).not.toBeInTheDocument();
  });

  it('Should not be visible if hidden on scroll', () => {
    activeRoute.set({ name: views.METHODS });
    headerHiddenOnScroll.set(true);
    const { queryByText } = render(Header);
    expect(queryByText('Name')).not.toBeInTheDocument();
  });
});
