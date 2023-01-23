import Topbar from 'topbar/ui/Topbar.svelte';
import { setTopbarBack } from 'topbar/sessionInterface';
import { getOption } from 'razorpay';

let topbar: Topbar | null;

/**
 * Creates a Topbar
 */
function create() {
  topbar = new Topbar({
    target: document.querySelector('#topbar-redesign-v15-wrap') as Element,
  });
}

export function showTopbar() {
  destroyTopbar();
  if (!isTopBarHidden()) {
    create();
    setTopbarBack(topbar);
    if (topbar) {
      topbar.show();
    }
  }
}

export function hideTopbar() {
  if (!topbar) {
    create();
    setTopbarBack(topbar);
  }
  if (topbar) {
    topbar.hide();
  }
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
