import CovidDonation from 'ui/components/covid-donations/index.svelte';
import { pushOverlay } from 'navstack';

// Rendering the covid donation bottom sheet
export function render(cb) {
  pushOverlay({
    component: CovidDonation,
    props: {
      onCompletionHandler: cb,
    },
  });
}
