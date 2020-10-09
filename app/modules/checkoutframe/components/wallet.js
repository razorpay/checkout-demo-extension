import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import WalletTab from 'ui/tabs/wallets/index.svelte';

const WALLET_KEY = 'walletTab';

export function render(props = {}) {
  const walletTab = new WalletTab({
    target: _Doc.querySelector('#form-fields'),
    props,
  });

  setView(WALLET_KEY, walletTab);
  getSession()[WALLET_KEY] = walletTab;
  walletTab.onShown();

  return walletTab;
}

export function destroy() {
  destroyView(WALLET_KEY);
  getSession()[WALLET_KEY] = null;
}
