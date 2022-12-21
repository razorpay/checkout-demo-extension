import Home from 'ui/tabs/home/index.svelte';
import { render } from '@testing-library/svelte';
import { setupPreferences } from 'tests/setupPreferences';

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('common/countrycodes', () => {
  return {
    ...jest.requireActual('common/countrycodes'),
    findCountryCode: jest.fn(() => ({
      phone: '8888888888',
      code: '+91',
    })),
  };
});
jest.mock('checkoutstore/screens/home', () => {
  return {
    ...jest.requireActual('checkoutstore/screens/home'),
    getCustomerCountryISOCode: jest.fn(() => 'IN'),
  };
});
jest.mock('cta', () => {
  return {
    ...jest.requireActual('cta'),
    showAuthenticate: jest.fn(),
    CTAHelper: {
      setActiveCTAScreen: jest.fn(),
    },
    setWithoutOffer: jest.fn(),
  };
});

describe('Home Render', () => {
  beforeEach(() => {
    setupPreferences('loggedin', razorpayInstance, {
      one_cc_capture_gstin: 'false',
    });
  });

  it('Home should be rendered', async () => {
    const result = render(Home);
    expect(result).toBeTruthy();
  });
  it(' Detail Screen should be rendered', async () => {
    const { container, getByText } = render(Home);
    expect(
      getByText('This payment is secured by Razorpay.')
    ).toBeInTheDocument();
    expect(getByText('Phone Number')).toBeInTheDocument();
    expect(getByText('Email')).toBeInTheDocument();
    expect(getByText('Country')).toBeInTheDocument();
  });
});
