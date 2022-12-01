import { render, fireEvent } from '@testing-library/svelte';
import GiftCardModal from 'one_click_checkout/gift_card/ui/GiftCardModal.svelte';
import giftCardLabels from 'one_click_checkout/gift_card/i18n/en';
import { popStack } from 'navstack';
import { applyGiftCard } from 'one_click_checkout/gift_card/helpers';
import { GC_NUMBER } from 'one_click_checkout/gift_card/constants';

const {
  modal_title: MODAL_TITLE,
  cta_label: CTA_LABEL,
  gift_card_number: GIFT_CARD_NUMBER,
} = giftCardLabels;

jest.mock('one_click_checkout/gift_card/helpers', () => {
  return {
    __esModule: true,
    applyGiftCard: jest.fn(),
  };
});

jest.mock('navstack', () => ({
  popStack: jest.fn(),
}));

describe('Gift Card Modal', () => {
  it('Should render the Gift card Modal', () => {
    const { getByText } = render(GiftCardModal);

    expect(getByText(GIFT_CARD_NUMBER)).toBeInTheDocument();
    expect(getByText(MODAL_TITLE)).toBeInTheDocument();
    expect(getByText(CTA_LABEL)).toBeInTheDocument();
  });
  it('Apply Gift Card', async () => {
    const { getByTestId, container } = render(GiftCardModal);
    const giftCardNumField = container.querySelector(
      `#${GC_NUMBER}`
    ) as HTMLElement;

    expect(giftCardNumField).toBeInTheDocument();
    await fireEvent.change(giftCardNumField, {
      target: { textContent: '678912' },
    });
    await fireEvent.click(getByTestId('modal-cta'));
    expect(applyGiftCard).toHaveBeenCalledTimes(1);
  });
  it('Clicking on close icon to close the Gift Card Modal', async () => {
    const { getByTestId } = render(GiftCardModal);

    await fireEvent.click(getByTestId('gift-card-close'));
    expect(popStack).toHaveBeenCalledTimes(1);
  });
});
