import type Header from 'header/ui/Header.svelte';
import { getSession } from 'sessionmanager';

export function handleModalClose() {
  const session = getSession();
  session.closeModal();
}

export function setHeaderBack(header: Header | undefined) {
  const session = getSession();
  if (header) {
    header.$on('back', session.back.bind(session));
  }
}
