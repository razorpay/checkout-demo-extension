import FpxTab from 'fpx/ui/index.svelte';
import { pushStack } from 'navstack';

export default function render() {
  pushStack({
    component: FpxTab,
  });
}
