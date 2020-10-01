import FeeLabel from 'ui/components/FeeLabel.svelte';

let feeLabel = null;

export function show(props) {
  feeLabel = new FeeLabel({
    target: _Doc.querySelector('.fee'),
    props,
  });
}
