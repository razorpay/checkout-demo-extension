/* global templates, showOverlay, hideEmi, Event */
import CovidDonation from 'ui/components/covid-donations/index.svelte';
// Rendering the covid donation bottom sheet
export function render(cb) {
  const wrap = _Doc.querySelector('#modal-inner');
  return new CovidDonation({
    target: wrap,
    props: {
      onCompletionHandler: cb,
    },
  });
}
