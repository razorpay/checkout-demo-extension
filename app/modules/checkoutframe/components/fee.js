import FeeLabel from 'ui/components/FeeLabel.svelte';

let feeLabel = true;

export function show(props) {
  feeLabel = new FeeLabel({
    target: _Doc.querySelector('.fee'),
    props,
  });
}

export function hide() {
  if (!feeLabel) {
    return false;
  }
}
