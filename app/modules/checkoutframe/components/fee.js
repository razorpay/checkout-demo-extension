import FeeLabel from 'ui/components/FeeLabel.svelte';
import { querySelector } from 'utils/doc';
export function show(props) {
  new FeeLabel({
    target: querySelector('.fee'),
    props,
  });
}
