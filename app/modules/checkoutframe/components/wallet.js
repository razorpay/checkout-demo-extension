import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import WalletTab from 'ui/tabs/wallets/index.svelte';

const WALLET_KEY = 'svelteWalletsTab';
const session = getSession();

export function render(props = {}) {
  const svelteWalletsTab = new WalletTab({
    target: gel('wallet-svelte-wrap'),
    props,
  });
  setView(WALLET_KEY, svelteWalletsTab);
  session[WALLET_KEY] = svelteWalletsTab;
  svelteWalletsTab.onShown();

  return svelteWalletsTab;
}

export function destroy() {
  destroyView(WALLET_KEY);
  session[WALLET_KEY] = null;
}
