import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import WalletTab from 'ui/tabs/wallets/index.svelte';

const WALLET_KEY = 'walletTab';

export function render(props = {}) {
  const walletTab = new WalletTab({
    target: _Doc.querySelector('#form-fields'),
    props,
  });

  // moving bottom to bottom :D
  /**
   * its require because mounting of wallet happen on click on wallet tab
   * bottom contain dcc, offers related UI & it suppose to below our payment methods
   * without this wallet tab is added after bottom which prevent DCC to show propertly on screen(check Bottom.svelte).
   */
  if (document.getElementById('form-fields')) {
    document
      .getElementById('form-fields')
      .appendChild(document.getElementById('bottom'));
  }
  setView(WALLET_KEY, walletTab);
  getSession()[WALLET_KEY] = walletTab;
  walletTab.onShown();

  return walletTab;
}

export function destroy() {
  destroyView(WALLET_KEY);
  getSession()[WALLET_KEY] = null;
}
