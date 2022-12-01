import { writable, derived, Writable, Readable } from 'svelte/store';
import type { appliedGiftCardsType } from 'one_click_checkout/gift_card/types/giftcard';

export const giftCardForm: Writable<Record<string, string>> = writable({});
export const appliedGiftCards: Writable<appliedGiftCardsType[]> = writable([]);
export const disableCOD: Writable<boolean> = writable(false);
export const optimisedGiftCards: Writable<appliedGiftCardsType[]> = writable(
  []
);
export const updatedGiftCards: Writable<appliedGiftCardsType[]> = writable([]);
export const totalAppliedGCAmt: Readable<number> = derived(
  [appliedGiftCards],
  ([$appliedGiftCards]) => {
    let total = 0;
    $appliedGiftCards.forEach(({ appliedAmt }) => {
      total += appliedAmt;
    });

    return total;
  }
);
