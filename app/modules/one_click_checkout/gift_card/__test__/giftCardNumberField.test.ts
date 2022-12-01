import { render, fireEvent } from '@testing-library/svelte';
import GiftCardNumber from 'one_click_checkout/gift_card/ui/GiftCardNumber.svelte';
import giftCardLabels from 'one_click_checkout/gift_card/i18n/en';
import { GC_NUMBER } from 'one_click_checkout/gift_card/constants';

const { gift_card_number: GIFT_CARD_NUMBER } = giftCardLabels;
const giftCardNumber = '678912';
const giftCardNumberProps = {
  value: '',
  error: '',
  handleInput: jest.fn(),
  handleBlur: jest.fn(),
};

describe('Gift Card Number Field', () => {
  it('Should render gift card number input on typing the Field', async () => {
    const { getByText, container } = render(
      GiftCardNumber,
      giftCardNumberProps
    );
    const giftCardNumField = container.querySelector(
      `#${GC_NUMBER}`
    ) as HTMLElement;

    expect(giftCardNumField).toBeInTheDocument();
    await fireEvent.change(giftCardNumField, {
      target: { textContent: giftCardNumber },
    });

    expect(getByText(GIFT_CARD_NUMBER)).toBeInTheDocument();
    expect(giftCardNumField?.textContent).toBe(giftCardNumber);
  });
});
