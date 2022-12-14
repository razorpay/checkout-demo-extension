import { pushStack } from 'navstack';
import EmandateTab from './index.svelte';

export default function renderEmandate() {
  pushStack({
    component: EmandateTab,
  });
}
