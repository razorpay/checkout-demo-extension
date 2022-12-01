import { render, fireEvent } from '@testing-library/svelte';
import GiftCardItem from 'one_click_checkout/gift_card/ui/GiftCardItem.svelte';
import { removeGiftCard } from 'one_click_checkout/gift_card/helpers';
import { MANUAL_GC_SOURCE } from 'one_click_checkout/gift_card/constants';

const giftCardNumber = '1234';

jest.mock('one_click_checkout/gift_card/helpers', () => {
  return {
    __esModule: true,
    removeGiftCard: jest.fn(),
  };
});

describe('Gift Card Item', () => {
  it('Should render gift card Item', async () => {
    const { getByText, getByTestId } = render(GiftCardItem, {
      giftCardNumber,
    });

    expect(getByText(giftCardNumber)).toBeInTheDocument();
    await fireEvent.click(getByTestId('rmv-item'));

    expect(removeGiftCard).toHaveBeenCalledTimes(1);
    expect(removeGiftCard).toHaveBeenCalledWith(
      [giftCardNumber],
      MANUAL_GC_SOURCE
    );
  });
});
