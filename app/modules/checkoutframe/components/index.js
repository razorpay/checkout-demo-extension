// svelte views
import PoweredBy from 'ui/components/PoweredBy.svelte';
import BankTransferScreen from 'ui/tabs/bank-transfer/index.svelte';
import TopBar from 'ui/components/Topbar.svelte';
import NavigationStack, { isStackPopulated } from 'navstack';

import { isPayout } from 'razorpay';
import { getSession } from 'sessionmanager';
import createPayoutsView from './payouts';
import { querySelector } from 'utils/doc';

let componentsMap = {};

export function render() {
  componentsMap.poweredBy = new PoweredBy({
    target: querySelector('#container'),
  });

  const navStack = new NavigationStack({
    target: querySelector('#root'),
  });

  componentsMap.navStack = navStack;

  const topbar = new TopBar({
    target: querySelector('#topbar-wrap'),
  });

  componentsMap.topbar = topbar;

  const session = getSession();
  session.topBar = topbar;
  if (isPayout()) {
    componentsMap.payoutsView = createPayoutsView({ topbar });
  } else {
    topbar.$on('back', () => {
      if (isStackPopulated()) {
        navStack.backPressed();
      } else {
        session.back();
      }
    });
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
      new BankTransferScreen({ target: querySelector('#form-fields') })
    );
  },

  destroy() {
    destroyView(BANK_TRANSFER_KEY);
  },
};
