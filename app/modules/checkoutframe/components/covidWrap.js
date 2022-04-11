/* global templates, showOverlay, hideEmi, Event */
import CovidDonation from 'ui/components/covid-donations/index.svelte';
import { querySelector } from 'utils/doc';
// Rendering the covid donation bottom sheet
export function render(cb) {
  const wrap = querySelector('#modal-inner');
  return new CovidDonation({
    target: wrap,
    props: {
      onCompletionHandler: cb,
    },
  });
}
