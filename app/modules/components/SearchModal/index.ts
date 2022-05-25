import { pushOverlay } from 'navstack';
import SearchModal from './SearchModal.svelte';

export default function triggerSearchModal(props = {}) {
  pushOverlay({
    component: SearchModal,
    props,
  });
}
