import { getSession } from 'sessionmanager';
import type Topbar from 'topbar/ui/Topbar.svelte';

export function setAmount(amount: number) {
  const session = getSession();
  session.setAmount(amount);
}

export function setTopbarBack(topbar: Topbar | null) {
  const session = getSession();
  topbar?.$on('back', session.back.bind(session));
}
