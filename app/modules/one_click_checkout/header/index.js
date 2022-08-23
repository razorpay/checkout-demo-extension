import Header from 'one_click_checkout/header/Header.svelte';

let header;

/**
 * Creates a Header
 */
function create() {
  header = new Header({
    target: document.querySelector('#header-redesign-v15-wrap'),
  });
}

export function showHeader() {
  if (!header) {
    create();
  }
}

/**
 * destroyHeader will be called when 1CC modal is closed
 */
export function destroyHeader() {
  if (!header) {
    return;
  }
  header.$destroy();
  header = null;
}
