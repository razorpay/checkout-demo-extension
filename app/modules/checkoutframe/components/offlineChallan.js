import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import OfflineChallanTab from 'ui/tabs/offline-challan/index.svelte';
import { querySelector } from 'utils/doc';
const COMPONENT_KEY = 'offlineTab';

export function render(props = {}) {
  const offlineChallanTab = new OfflineChallanTab({
    target: querySelector('#form-fields'),
    props,
  });

  // moving bottom to bottom :D
  /**
   * its require because mounting of providers happen on click on international tab
   * bottom contain dcc, offers related UI & it suppose to below our payment methods
   * without this wallet tab is added after bottom which prevent DCC to show properly on screen(check Bottom.svelte).
   */
  if (document.getElementById('form-fields')) {
    document
      .getElementById('form-fields')
      .appendChild(document.getElementById('bottom'));
  }
  setView(COMPONENT_KEY, offlineChallanTab);
  getSession()[COMPONENT_KEY] = offlineChallanTab;

  return offlineChallanTab;
}

export function destroy() {
  destroyView(COMPONENT_KEY);
  getSession()[COMPONENT_KEY] = null;
}
