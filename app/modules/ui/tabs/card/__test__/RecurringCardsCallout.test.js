import { fireEvent, render } from '@testing-library/svelte';
import RecurringCardsCallout from '../RecurringCardsCallout.svelte';
import RecurringCardsOverlay from '../RecurringCardsOverlay.svelte';
import { pushOverlay } from 'navstack';

jest.mock('navstack', () => {
  return {
    pushOverlay: jest.fn(),
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
        "Only limited cards support recurring payments as per RBI's new regulations.";
      expect(getByText(label)).toBeInTheDocument();
    });

    it('should open recurring cards overlay on click of `View supported cards`', () => {
      const { getByText } = render(RecurringCardsCallout);

      const viewSupportedLink = getByText('View supported cards');
      fireEvent.click(viewSupportedLink);

      expect(pushOverlay).toHaveBeenCalledTimes(1);
      expect(pushOverlay).toHaveBeenCalledWith({
        component: RecurringCardsOverlay,
      });
    });
  });
});
