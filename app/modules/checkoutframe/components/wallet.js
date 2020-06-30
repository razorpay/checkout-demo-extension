import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import WalletTab from 'ui/tabs/wallets/index.svelte';

const WALLET_KEY = 'svelteWalletsTab';

export function render(props = {}) {
  const svelteWalletsTab = new WalletTab({
    target: _Doc.querySelector('#form-fields'),
    props,
  });

  setView(WALLET_KEY, svelteWalletsTab);
  getSession()[WALLET_KEY] = svelteWalletsTab;
  svelteWalletsTab.onShown();

  return svelteWalletsTab;
}

export function destroy() {
  destroyView(WALLET_KEY);
  getSession()[WALLET_KEY] = null;
}
