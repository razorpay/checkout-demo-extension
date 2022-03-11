import RTBModal from 'one_click_checkout/rtb_modal/ui/RTBModal.svelte';

let modal;

/**
 * Creates a new RTB modal
 */
function create() {
  modal = new RTBModal({
    target: document.getElementById('one-cc-rtb'),
  });
}

export function showRTBModal() {
  if (!modal) {
    create();
  }
  modal.show();
}
