import Topbar from 'one_click_checkout/topbar/ui/Topbar.svelte';
import { setTopbarBack } from 'one_click_checkout/topbar/sessionInterface';

let topbar;

/**
 * Creates a Topbar
 */
function create() {
  topbar = new Topbar({
    target: document.querySelector('#topbar-onecc-wrap'),
  });
}

export function showTopbar() {
  if (!topbar) {
    create();
  }
  setTopbarBack(topbar);
}
