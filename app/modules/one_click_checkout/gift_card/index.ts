import { pushOverlay } from 'navstack';
import GiftCardModal from 'one_click_checkout/gift_card/ui/GiftCardModal.svelte';

/**
 * Method to show the Gift card modal
 */
export function showGiftCardModal() {
  pushOverlay({
    component: GiftCardModal,
  });
}
