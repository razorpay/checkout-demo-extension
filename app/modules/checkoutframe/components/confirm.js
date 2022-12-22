import { isOverlayActive, pushOverlay } from 'navstack';
import Confirm from 'ui/components/Confirm.svelte';

export function isVisible() {
  return isOverlayActive(Confirm);
}

export function show(props) {
  if (isVisible()) {
    return;
  }
  pushOverlay({
    component: Confirm,
    props,
  });
}
export function confirmClose(props = {}) {
  return new Promise(function (resolve) {
    show({
      onPositiveClick: () => resolve(true),
      onNegativeClick: () => resolve(false),
      ...props,
    });
  });
}
