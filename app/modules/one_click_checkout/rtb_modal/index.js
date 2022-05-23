import { pushOverlay } from 'navstack';
import RTBModal from 'one_click_checkout/rtb_modal/ui/RTBModal.svelte';

export function showRTBModal() {
  pushOverlay({
    component: RTBModal,
  });
}
