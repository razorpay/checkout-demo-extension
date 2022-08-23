import Header from 'header/ui/Header.svelte';
import { setHeaderBack } from './sessionInterface';
import { expandedHeader } from './store';

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
  if (header) {
    header?.$destroy?.();
    header = null;
  }
  create();
  setHeaderBack(header);
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

export function toggleHeaderExpansion(expanded) {
  expandedHeader.set(expanded);
}

export { expandedHeader };
