// svelte views
import PoweredBy from 'ui/components/PoweredBy.svelte';
import BankTransferScreen from 'ui/tabs/bank-transfer/index.svelte';
import TopBar from 'ui/components/Topbar.svelte';

import { isPayout } from 'checkoutstore';
import Analytics from 'analytics';
import { getSession } from 'sessionmanager';
import createPayoutsView from './payouts';

let componentsMap = {};

export function render() {
  componentsMap.poweredBy = new PoweredBy({
    target: _Doc.querySelector('#container'),
  });

  const topbar = (componentsMap.topbar = new TopBar({
    target: _Doc.querySelector('#topbar-wrap'),
  }));

  const session = getSession();
  session.topBar = topbar;
  if (isPayout()) {
    componentsMap.payoutsView = createPayoutsView({ topbar });
  } else {
    topbar.$on('back', session.back.bind(session));
  }
}

export function destroyAll() {
  componentsMap |> _Obj.loop(destroy);
  componentsMap = {};
  getSession().topBar = null;
}

export function getView(key) {
  return componentsMap[key];
}

export function destroyView(key) {
  setView(key, null);
}

export function setView(key, view) {
  destroy(componentsMap[key]);
  componentsMap[key] = view;
}

function destroy(c) {
  c && c.$destroy();
}

const BANK_TRANSFER_KEY = 'bankTransferView';
export const bankTransferTab = {
  render() {
    setView(
      BANK_TRANSFER_KEY,
      new BankTransferScreen({ target: _Doc.querySelector('#form-fields') })
    );
  },

  destroy() {
    destroyView(BANK_TRANSFER_KEY);
  },
};
