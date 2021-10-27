import SummaryModal from 'one_click_checkout/summary_modal/ui/SummaryModal.svelte';

let modal;

/**
 * Creates a new summmary modal
 */
function create() {
  modal = new SummaryModal({
    target: document.getElementById('one-cc-summary'),
  });
}

/**
 * Method to show the summary modal
 * @param {boolean} withCta Flag which indicates if confirm CTA should be shown or not
 * @returns
 */
export function showSummaryModal(withCta) {
  if (!modal) {
    create();
  }
  modal.toggleCta(withCta);
  modal.show();
}
