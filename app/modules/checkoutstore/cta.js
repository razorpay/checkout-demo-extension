import { writable } from 'svelte/store';

export const cta = writable('');

cta.subscribe(text => {
  const span = _Doc.querySelector('#footer > span');

  if (span) {
    _El.setContents(span, text);
  }
});

export function updateCta(text) {
  cta.set(text);
}
