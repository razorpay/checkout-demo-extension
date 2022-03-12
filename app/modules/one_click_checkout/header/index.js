import Header from 'one_click_checkout/header/Header.svelte';

let header;

/**
 * Creates a Header
 */
function create() {
  header = new Header({
    target: document.querySelector('#header-1cc-wrap'),
  });
}

export function showHeader() {
  if (!header) {
    create();
  }
}
