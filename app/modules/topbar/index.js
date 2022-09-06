import Topbar from 'topbar/ui/Topbar.svelte';
import { setTopbarBack } from 'topbar/sessionInterface';
import { getOption } from 'razorpay';

let topbar;

/**
 * Creates a Topbar
 */
function create() {
  topbar = new Topbar({
    target: document.querySelector('#topbar-redesign-v15-wrap'),
  });
}

export function showTopbar() {
  destroyTopbar();
  if (!isTopBarHidden()) {
    create();
    setTopbarBack(topbar);
    topbar.show();
  }
}

export function hideTopbar() {
  if (!topbar) {
    create();
    setTopbarBack(topbar);
  }
  topbar.hide();
}

/**
 * destroyTopbar will be called when 1CC modal is closed
 */
export function destroyTopbar() {
  if (!topbar) {
    return;
  }
  topbar.$destroy();
  topbar = null;
}

export function isTopBarHidden() {
  return getOption('theme.hide_topbar');
}
