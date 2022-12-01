import { get } from 'svelte/store';
import { render, fireEvent } from '@testing-library/svelte';
import GiftCardBanner from 'one_click_checkout/gift_card/ui/GiftCardBanner.svelte';
import giftCardLabels from 'one_click_checkout/gift_card/i18n/en';
import {
  appliedGiftCards,
  totalAppliedGCAmt,
} from 'one_click_checkout/gift_card/store';
import { formatAmountWithSymbol } from 'common/currency';
import { getCurrency } from 'razorpay';
import { format } from 'i18n';
import { amount } from 'one_click_checkout/charges/store';
import { setupPreferences } from 'tests/setupPreferences';
import { removeGiftCard } from 'one_click_checkout/gift_card/helpers';
import { MANUAL_GC_SOURCE } from 'one_click_checkout/gift_card/constants';
import { showGiftCardModal } from 'one_click_checkout/gift_card';

const {
  gift_card: GIFT_CARD,
  applied: APPLIED,
  pay_gift_card: PAY_GIFT_CARD,
  remove: REMOVE,
} = giftCardLabels;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

jest.mock('one_click_checkout/gift_card', () => ({
  showGiftCardModal: jest.fn(),
}));

jest.mock('one_click_checkout/gift_card/helpers', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/gift_card/helpers'
  );

  return {
    __esModule: true,
    ...originalModule,
    removeGiftCard: jest.fn(),
  };
});

describe('Gift Card Banner', () => {
  it('Should render the gift card Banner', () => {
    const { getByText, getAllByText } = render(GiftCardBanner);

    expect(getAllByText(GIFT_CARD)).toHaveLength(2);
    expect(getByText(PAY_GIFT_CARD)).toBeInTheDocument();
  });
  it('Should render the gift card Banner after gift card applied for single GC scenario', async () => {
    const giftCardNumber = '566999';
    appliedGiftCards.set([
      {
        giftCardNumber,
        giftCardValue: 10000, // actual gift card value ₹100
        appliedAmt: 10000, // applied gift card amount ₹100
        balanceAmt: 0, // balance gift card amount ₹0
      },
    ]);
    const { getByText, getByTestId } = render(GiftCardBanner);

    const appliedGCText = `${formatAmountWithSymbol(
      get(totalAppliedGCAmt),
      getCurrency(),
      false
    )} ${format(APPLIED)}`;
    expect(getByText(appliedGCText)).toBeInTheDocument();
    expect(getByText(REMOVE)).toBeInTheDocument();
    await fireEvent.click(getByTestId('rmv-btn'));
    expect(removeGiftCard).toHaveBeenCalledTimes(1);
    expect(removeGiftCard).toHaveBeenCalledWith(
      [giftCardNumber],
      MANUAL_GC_SOURCE
    );
  });
  it('Should allow apply gift card for multiple GC scenario', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': {
        configs: {
          one_cc_gift_card: true,
          one_cc_multiple_gift_card: true,
        },
      },
    });
    amount.set(5000); // ₹50
    const { getByTestId, container } = render(GiftCardBanner);

    await fireEvent.click(getByTestId('gift-card-sec'));
    expect(showGiftCardModal).toHaveBeenCalledTimes(1);
  });
  it('Should not allow apply gift card if total reaches minimum amount(₹1)', () => {
    setupPreferences('loggedIn', razorpayInstance, {
      '1cc': {
        configs: {
          one_cc_gift_card: true,
          one_cc_multiple_gift_card: true,
        },
      },
    });
    amount.set(100); // ₹1
    const { getByTestId, container } = render(GiftCardBanner);

    expect(getByTestId('arrow-btn')).toHaveClass('disable-arrow-btn');
    // Applied Gift cards need to visible for multiple gift card scenario
    expect(container.getElementsByClassName('list-sec')).toHaveLength(1);
  });
});
