// svelte views
import PoweredBy from 'ui/components/PoweredBy.svelte';
import BankTransferScreen from 'ui/tabs/bank-transfer/index.svelte';
import TopBar from 'ui/components/Topbar.svelte';
import { showTopbar } from 'one_click_checkout/topbar';
import { showHeader } from 'one_click_checkout/header';
import { isPayout } from 'checkoutstore';
import { getSession } from 'sessionmanager';
import createPayoutsView from './payouts';
import { isOneClickCheckout } from 'razorpay';

let componentsMap = {};

export function render() {
  componentsMap.poweredBy = new PoweredBy({
    target: _Doc.querySelector('#container'),
  });

  const topbar = (componentsMap.topbar = new TopBar({
    target: document.querySelector('#topbar-wrap'),
  }));

  const session = getSession();
  session.topBar = topbar;

  if (isOneClickCheckout()) {
    showHeader();
    showTopbar();
  }

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
