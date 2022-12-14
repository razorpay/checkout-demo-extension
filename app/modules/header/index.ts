import Header from 'header/ui/Header.svelte';
import { setHeaderBack } from './sessionInterface';

let header: Header | undefined;

/**
 * Creates a Header
 */
function create() {
  const headerElement = document.querySelector(
    '#header-redesign-v15-wrap'
  ) as Element;
  if (headerElement) {
    header = new Header({
      target: headerElement,
    });
  }
}

export function showHeader(onBack: () => void) {
  if (header) {
    header?.$destroy?.();
    header = undefined;
  }
  create();
  if (header) {
    (header as Header).$on('goback', onBack);
  }
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
  header = undefined;
}
