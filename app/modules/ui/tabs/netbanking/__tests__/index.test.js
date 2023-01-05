import NetBanking from 'ui/tabs/netbanking/index.svelte';
import { render } from '@testing-library/svelte';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  isRedesignV15: jest.fn(() => true),
  subscribe: jest.fn(() => {}),
  isOneClickCheckout: jest.fn(() => {}),
  getAmount: jest.fn(() => {}),
  getCurrency: jest.fn(() => {}),
  getPreferences: jest.fn(() => {}),
  isRecurring: jest.fn(() => {}),
  isCAW: jest.fn(() => {}),
  hasMerchantPolicy: jest.fn(() => {}),
  getOption: jest.fn(() => {}),
  getMerchantOrder: jest.fn(),
}));

jest.mock('one_click_checkout/sessionInterface', () => {
  return {
    ...jest.requireActual('one_click_checkout/sessionInterface'),
    getIcons: jest.fn(() => ({})),
  };
});
jest.mock('checkoutstore/theme', () => {
  return {
    ...jest.requireActual('checkoutstore/theme'),
    getIcons: jest.fn(() => ({})),
  };
});
jest.mock('cta', () => {
  return {
    ...jest.requireActual('cta'),
    isCtaShown: jest.fn(() => ({})),
    CTAHelper: { setActiveCTAScreen: jest.fn(() => ({})) },
    showCta: jest.fn(() => ({})),
  };
});

describe('index.svelte', () => {
  it('should render without breaking', () => {
    const { container } = render(NetBanking, {
      props: {
        banks: ['HDFC', 'SBI'],
        method: 'netbanking',
      },
    });
    expect(container).toBeTruthy();
  });
  it('should have the label Select Bank', () => {
    const { getByText } = render(NetBanking, {
      props: {
        banks: ['HDFC', 'SBI'],
        method: 'netbanking',
      },
    });
    expect(getByText('Select Bank')).toBeInTheDocument();
  });
  it('should have the bank label HDFC', () => {
    const { getByText } = render(NetBanking, {
      props: {
        banks: ['HDFC'],
        method: 'netbanking',
      },
    });
    expect(getByText('HDFC')).toBeInTheDocument();
  });
  it('should have the bank label SBI', () => {
    const { getByText } = render(NetBanking, {
      props: {
        banks: ['SBI'],
        method: 'netbanking',
      },
    });
    expect(getByText('SBI')).toBeInTheDocument();
  });
});
