import FeeLabel from 'ui/components/FeeLabel.svelte';
import { querySelector } from 'utils/doc';
let feeLabel = null;

export function show(props) {
  feeLabel = new FeeLabel({
    target: querySelector('.fee'),
    props,
  });
}
