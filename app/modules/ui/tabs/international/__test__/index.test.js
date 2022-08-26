import { render, cleanup, fireEvent } from '@testing-library/svelte';
import Analytics from 'analytics';
import International from '../index.svelte';
import { setupPreferences } from 'tests/setupPreferences';

jest.mock('checkoutstore/theme', () => ({
  ...jest.requireActual('checkoutstore/theme'),
  getThemeMeta: () => ({
    icons: {},
  }),
}));

jest.mock('cta', () => ({
  ...jest.requireActual('cta'),
  __esModule: true,
  isCtaShown: () => true,
  setWithoutOffer: jest.fn(),
  setAppropriateCtaText: jest.fn(),
  showCta: jest.fn(),
  hideCta: jest.fn(),
  disableCTA: jest.fn(),
  CTAHelper: {
    setActiveCTAScreen: jest.fn(),
  },
  showCtaWithDefaultText: jest.fn(),
}));

const mockRzpPrototype = {
  key: 'key',
  amount: 100,
  getCurrencies: jest.fn((options) => {
    return new Promise((resolve) => {
      const response = {
        recurring: false,
        all_currencies: {
          USD: {
            code: '840',
            denomination: 100,
            min_value: 50,
            min_auth_value: 50,
            symbol: '$',
            name: 'US Dollar',
            amount: 5250,
          },
        },
        currency_request_id: 'EW1CiHoC8eARvW',
        card_currency: 'USD',
        avs_required: true,
        address_name_required: true,
      };
      resolve(response);
    });
  }),
};

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg) => {
    if (!arg) {
      return mockRzpPrototype;
    }
    return mockRzpPrototype[arg] || arg;
  },
  getMode: () => 'test',
  ...mockRzpPrototype,
};

describe('Test International/index.svelte component', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', razorpayInstance);
    Analytics.setR(razorpayInstance);
  });

  afterEach(cleanup);

  it('should render', () => {
    const { container } = render(International);
    expect(container).toBeTruthy();
  });

  it('should render all providers', async () => {
    const { container, getAllByRole } = render(International);
    // should show default view as SELECT_PROVIDERS
    expect(container.querySelectorAll('.border-list').length).toBe(1);
    expect(
      container.querySelectorAll('.border-list .title-container').length
    ).toBe(2);

    let allProviders = Array.from(
      container.querySelectorAll('.border-list button')
    ).map((el) => el.textContent.trim());

    expect(allProviders).toEqual(['Trustly', 'Poli']);

    allProviders = getAllByRole('listitem');

    await fireEvent.click(allProviders[0]);

    // Render DCC View
    expect(container.querySelectorAll('.dcc-view').length).toBe(1);

    // Should be on same view as before
    expect(container.querySelectorAll('.border-list').length).toBe(1);
  });
});
