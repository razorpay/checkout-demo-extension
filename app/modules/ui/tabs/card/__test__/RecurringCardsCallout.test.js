import { fireEvent, render } from '@testing-library/svelte';
import RecurringCardsCallout from '../RecurringCardsCallout.svelte';
import RecurringCardsOverlay from '../RecurringCardsOverlay.svelte';

const mockSession = {
  showOverlay: jest.fn(),
};
jest.mock('sessionmanager', () => ({
  getSession: () => mockSession,
}));

/**
 * Mocking RecurringCardsOverlay Component
 */
jest.mock('../RecurringCardsOverlay.svelte', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(function () {
      this.$destroy = jest.fn();
    }),
  };
});

describe('RecurringCardsCallout.svelte', () => {
  describe('Labels', () => {
    it('View Supported Cards', () => {
      const { getByText } = render(RecurringCardsCallout);
      expect(getByText('View supported cards')).toBeInTheDocument();
    });

    it('Limited cards support', () => {
      const { getByText } = render(RecurringCardsCallout);
      const label =
        'Only limited cards support recurring payments due to new payment regulations by RBI.';
      expect(getByText(label)).toBeInTheDocument();
    });

    it('should open recurring cards overlay on click of `View supported cards`', () => {
      const { getByText } = render(RecurringCardsCallout);

      const viewSupportedLink = getByText('View supported cards');
      fireEvent.click(viewSupportedLink);

      expect(mockSession.showOverlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('Recurring cards overlay', () => {
    it('should initialize overlay component on mount of callout component', () => {
      expect(RecurringCardsOverlay).toHaveBeenCalledTimes(0);

      render(RecurringCardsCallout);

      expect(RecurringCardsOverlay).toHaveBeenCalledTimes(1);
    });

    it('should destroy overlay component on unmount of callout component', () => {
      const { unmount } = render(RecurringCardsCallout);
      let mockOverlayDestroy = RecurringCardsOverlay.mock.instances[0].$destroy;

      expect(mockOverlayDestroy).toHaveBeenCalledTimes(0);

      unmount();

      expect(mockOverlayDestroy).toHaveBeenCalledTimes(1);
    });
  });
});
