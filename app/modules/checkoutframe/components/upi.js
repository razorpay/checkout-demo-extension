import { isMethodEnabled } from 'checkoutstore/methods';
import { setView, destroyView } from './';
import { getSession } from 'sessionmanager';

import UpiTab from 'ui/tabs/upi/index.svelte';
const UPI_KEY = 'upiTab';

export function render(props = {}) {
  const upiTab = new UpiTab({
    target: _Doc.querySelector('#form-fields'),
    props,
  });
  setView(UPI_KEY, upiTab);
  getSession()[UPI_KEY] = upiTab;
  upiTab.onShown();
  return upiTab;
}

export function destroy() {
  destroyView(UPI_KEY);
  getSession()[UPI_KEY] = null;
}
