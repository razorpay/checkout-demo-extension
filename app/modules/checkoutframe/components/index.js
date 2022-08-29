// svelte views
import PoweredBy from 'ui/components/PoweredBy.svelte';
import BankTransferScreen from 'ui/tabs/bank-transfer/index.svelte';
import TopBar from 'ui/components/Topbar.svelte';
import { showTopbar as show1CCTopbar } from 'one_click_checkout/topbar';
import { showHeader as show1CCHeader } from 'one_click_checkout/header';
import { getSession } from 'sessionmanager';
import createPayoutsView from './payouts';
import { isOneClickCheckout, isPayout, isRedesignV15 } from 'razorpay';
import { querySelector } from 'utils/doc';
import * as ObjectUtils from 'utils/object';
import { showTopbar } from 'topbar';
import { showHeader } from 'header';

let componentsMap = {};

export function render() {
  componentsMap.poweredBy = new PoweredBy({
    target: querySelector('#container'),
  });

  const topbar = new TopBar({
    target: querySelector('#topbar-wrap'),
  });

  componentsMap.topbar = topbar;

  const session = getSession();
  session.topBar = topbar;

  if (isOneClickCheckout()) {
    show1CCHeader();
    show1CCTopbar();
  } else if (isRedesignV15()) {
    showHeader();
    showTopbar();
  }

  if (isPayout()) {
    componentsMap.payoutsView = createPayoutsView({ topbar });
  } else {
    topbar.$on('back', () => {
      session.back();
    });
  }
}

export function destroyAll() {
  ObjectUtils.loop(componentsMap, destroy);
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
