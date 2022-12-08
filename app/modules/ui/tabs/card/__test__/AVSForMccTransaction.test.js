import { render } from '@testing-library/svelte';
import SavedCard from '../index.svelte';
import { setupPreferences } from 'tests/setupPreferences';

jest.mock('cta', () => ({
  ...jest.requireActual('cta'),
  isCtaShown: () => true,
  setWithoutOffer: jest.fn(),
  setAppropriateCtaText: jest.fn(),
  CTAHelper: {
    setActiveCTAScreen: jest.fn(),
  },
}));

jest.mock('checkoutstore/theme', () => ({
  ...jest.requireActual('checkoutstore/theme'),
  getIcons: jest.fn(() => ({})),
  getThemeMeta: jest.fn(() => ({
    icons: {
      user_protect: 'icon',
    },
  })),
}));

describe('Billing Address Collection for Saved Cards', () => {
  beforeEach(() => {
    setupPreferences();
  });
  describe('AVS flag enabled', () => {
    it('Should render the saved cards screen', () => {
      const { component } = render(SavedCard, {});
      expect(component).toBeTruthy();
    });
  });
});
