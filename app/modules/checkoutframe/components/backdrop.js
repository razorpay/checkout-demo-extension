import Backdrop from 'ui/components/Backdrop.svelte';

// Backdrop which is used with overlays like Fee/EMI etc.
// Not to be confused with #backdrop.
let backdrop = null;

export function setup(options) {
  backdrop = new Backdrop(options);
}

export function isVisible() {
  if (backdrop) {
    return backdrop.isVisible();
  }
  return false;
}

export function show() {
  if (backdrop) {
    backdrop.show();
  }
}

export function hide() {
  if (backdrop) {
    backdrop.hide();
  }
}
