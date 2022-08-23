import { pushOverlay } from 'navstack';
import SummaryModal from 'summary_modal/ui/SummaryModal.svelte';

/**
 * Method to show the summary modal
 * @param {boolean} withCta Flag which indicates if confirm CTA should be shown or not
 * @returns
 */
export function showSummaryModal({ withCta, withCart = true }) {
  pushOverlay({
    component: SummaryModal,
    props: {
      ctaVisible: withCta,
      cartVisible: withCart,
    },
  });
}
